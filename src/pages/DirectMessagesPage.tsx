import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useConversations, useConversationsSubscription, useCreateConversation } from '@/hooks/useDirectMessages'
import { dbService } from '@/services/firebase'
import { useQuery } from '@tanstack/react-query'
import { Avatar, EmptyState, Spinner, FadeIn } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import type { Conversation, UserProfile } from '@/types'
import type { Timestamp } from 'firebase/firestore'

function formatMessageTime(timestamp: Timestamp | Date | undefined): string {
  if (!timestamp) return ''
  const date = 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function isUnread(conversation: Conversation, userId: string): boolean {
  if (!conversation.lastMessage) return false
  if (conversation.lastMessage.senderId === userId) return false
  const lastRead = conversation.lastReadAt?.[userId]
  if (!lastRead) return true
  const lastReadDate = 'toDate' in lastRead ? lastRead.toDate() : new Date(lastRead)
  const msgDate = 'toDate' in conversation.lastMessage.createdAt
    ? conversation.lastMessage.createdAt.toDate()
    : new Date(conversation.lastMessage.createdAt)
  return msgDate > lastReadDate
}

export function DirectMessagesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')

  const { data: conversations = [], isLoading } = useConversations(user?.id || null)
  useConversationsSubscription(user?.id || null)

  const { data: allUsers = [] } = useQuery({
    queryKey: ['directoryProfiles'],
    queryFn: () => dbService.getAllPublicProfiles(),
    enabled: showNewMessage && !!user,
  })

  const { showToast } = useToast()
  const createConversation = useCreateConversation()

  const filteredMembers = useMemo(() => {
    // Only members who opted into the directory can be started a new chat with.
    // (Admins reach hidden members via the directory → Message instead.)
    const discoverable = allUsers.filter(
      (u: UserProfile) => u.id !== user?.id && u.listInDirectory === true,
    )
    if (!memberSearch.trim()) return discoverable
    const q = memberSearch.toLowerCase()
    return discoverable.filter((u: UserProfile) => u.displayName.toLowerCase().includes(q))
  }, [allUsers, memberSearch, user?.id])

  const handleSelectMember = async (member: UserProfile) => {
    if (!user) return
    try {
      const conversation = await createConversation.mutateAsync({
        currentUserId: user.id,
        currentUser: { displayName: user.displayName, photoURL: user.photoURL },
        otherUserId: member.id,
        otherUser: { displayName: member.displayName, photoURL: member.photoURL },
      })
      setShowNewMessage(false)
      setMemberSearch('')
      navigate(`/messages/${conversation.id}`)
    } catch (error) {
      console.error('Failed to create conversation:', error)
      showToast('Failed to start conversation. Please try again.', 'error')
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    const otherId = conversation.participantIds.find((id) => id !== user?.id)
    if (!otherId) return { displayName: 'Unknown', photoURL: undefined }
    return conversation.participants[otherId] || { displayName: 'Unknown', photoURL: undefined }
  }

  return (
    <div className="max-w-[800px] mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest mb-1">Messages</h1>
          <p className="text-text-light m-0">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowNewMessage(!showNewMessage)}
          className="flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-md text-sm font-medium hover:bg-forest/90 transition-colors"
        >
          {showNewMessage ? <X size={18} /> : <Plus size={18} />}
          {showNewMessage ? 'Cancel' : 'New Message'}
        </button>
      </div>

      {showNewMessage && (
        <div className="mb-6 bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ebe6dc]">
            <Search size={18} className="text-text-light shrink-0" />
            <input
              type="text"
              className="w-full border-none p-0 bg-transparent font-body text-sm outline-none"
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto divide-y divide-[#ebe6dc]">
            {filteredMembers.length === 0 ? (
              <p className="text-sm text-text-light text-center py-4 m-0">No members found</p>
            ) : (
              filteredMembers.map((member: UserProfile) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-cream/50 transition-colors"
                >
                  <Avatar src={member.photoURL} name={member.displayName} size="sm" />
                  <span className="text-sm font-medium">{member.displayName}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="message"
          title="No messages yet"
          message="Start a conversation with a church member"
        />
      ) : (
        <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
          {conversations.map((conversation) => {
            const other = getOtherParticipant(conversation)
            const unread = user ? isUnread(conversation, user.id) : false
            const snippet = conversation.lastMessage?.content?.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1') || ''

            return (
              <button
                key={conversation.id}
                onClick={() => navigate(`/messages/${conversation.id}`)}
                className={`flex items-center gap-3 px-4 py-3 text-left w-full cursor-pointer hover:bg-cream/30 transition-colors ${unread ? 'bg-forest/5' : ''}`}
              >
                <div className="relative shrink-0">
                  <Avatar src={other.photoURL} name={other.displayName} size="md" />
                  {unread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-forest rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm m-0 truncate ${unread ? 'font-bold' : 'font-medium'}`}>
                      {other.displayName}
                    </h3>
                    <span className="text-xs text-text-light shrink-0">
                      {formatMessageTime(conversation.lastMessage?.createdAt)}
                    </span>
                  </div>
                  {snippet && (
                    <p className={`text-sm m-0 truncate ${unread ? 'text-text font-medium' : 'text-text-light'}`}>
                      {conversation.lastMessage?.senderId === user?.id ? 'You: ' : ''}
                      {snippet}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </FadeIn>
      )}
    </div>
  )
}

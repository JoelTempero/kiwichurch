import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useMessages,
  useMessagesSubscription,
  useSendMessage,
  useMarkConversationRead,
} from '@/hooks/useDirectMessages'
import { dbService } from '@/services/firebase'
import { useQuery } from '@tanstack/react-query'
import { Avatar, Spinner, FadeIn } from '@/components/common'
import { MentionInput, type MentionMember } from '@/components/common/MentionInput'
import { parseMentions, encodeMention } from '@/utils/mentions'
import type { DirectMessage } from '@/types'
import type { Timestamp } from 'firebase/firestore'

function toDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date()
  if ('toDate' in timestamp) return timestamp.toDate()
  return new Date(timestamp)
}

function formatTime(timestamp: Timestamp | Date | null | undefined): string {
  return toDate(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDateSeparator(timestamp: Timestamp | Date | null | undefined): string {
  const date = toDate(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

function shouldShowDateSeparator(
  current: DirectMessage,
  previous: DirectMessage | undefined
): boolean {
  if (!previous) return true
  return toDate(current.createdAt).toDateString() !== toDate(previous.createdAt).toDateString()
}

function MessageContent({ content }: { content: string }) {
  const segments = parseMentions(content)
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === 'mention' ? (
          <span key={i} className="font-semibold text-forest-light">@{seg.content}</span>
        ) : (
          <span key={i}>{seg.content}</span>
        )
      )}
    </>
  )
}

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messageText, setMessageText] = useState('')
  const [mentions, setMentions] = useState<Map<string, string>>(new Map())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => dbService.getConversation(conversationId!),
    enabled: !!conversationId,
  })

  const { data: messages = [], isLoading } = useMessages(conversationId || null)
  useMessagesSubscription(conversationId || null)

  const sendMessage = useSendMessage()
  const markRead = useMarkConversationRead()

  const otherId = conversation?.participantIds.find((id) => id !== user?.id) || ''
  const otherParticipant = conversation?.participants[otherId]

  const membersList: MentionMember[] = conversation
    ? Object.entries(conversation.participants)
        .filter(([id]) => id !== user?.id)
        .map(([id, p]) => ({ id, displayName: p.displayName, photoURL: p.photoURL }))
    : []

  useEffect(() => {
    if (conversationId && user?.id) {
      markRead.mutate({ conversationId, userId: user.id })
    }
  }, [conversationId, user?.id, messages.length])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, scrollToBottom])

  const handleSend = async () => {
    if (!messageText.trim() || !user || !conversationId || !otherId) return

    let content = messageText
    for (const [displayName, userId] of mentions) {
      const atPattern = new RegExp(`@${displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
      content = content.replace(atPattern, encodeMention(displayName, userId))
    }

    setMessageText('')
    setMentions(new Map())

    await sendMessage.mutateAsync({
      conversationId,
      recipientId: otherId,
      messageData: {
        senderId: user.id,
        senderName: user.displayName,
        senderPhotoURL: user.photoURL,
        content,
        mentions: Array.from(mentions.values()),
      },
    })
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-128px)] md:h-[calc(100vh-96px)] max-w-[800px] mx-auto">
      {otherParticipant && (
        <h1 className="sr-only">Conversation with {otherParticipant.displayName}</h1>
      )}
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e0dbd2] shrink-0">
        <button
          onClick={() => navigate('/messages')}
          className="p-1 rounded-md hover:bg-cream/50 transition-colors"
          aria-label="Back to messages"
        >
          <ArrowLeft size={20} />
        </button>
        {otherParticipant && (
          <>
            <Avatar src={otherParticipant.photoURL} name={otherParticipant.displayName} size="sm" />
            <h2 className="text-base font-semibold m-0">{otherParticipant.displayName}</h2>
          </>
        )}
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <Spinner />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-8">
            {otherParticipant && (
              <>
                <Avatar src={otherParticipant.photoURL} name={otherParticipant.displayName} size="lg" />
                <p className="text-text-light mt-3 mb-0 text-base">
                  Start a conversation with {otherParticipant.displayName}
                </p>
              </>
            )}
          </div>
        ) : (
          <FadeIn className="flex flex-col gap-1">
            {messages.map((msg, i) => {
              const isOwn = msg.senderId === user?.id
              const showDate = shouldShowDateSeparator(msg, messages[i - 1])

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-text-light bg-cream px-3 py-1 rounded-full">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                    <div
                      className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-[14px] ${
                        isOwn
                          ? 'bg-forest text-white rounded-br-sm'
                          : 'bg-[#f5f3ef] rounded-bl-sm'
                      }`}
                    >
                      <span className="block whitespace-pre-wrap break-words">
                        <MessageContent content={msg.content} />
                      </span>
                      <span className={`block text-[10px] mt-0.5 leading-tight text-right ${isOwn ? 'text-white/50' : 'text-text-lighter'}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </FadeIn>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-cream shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <MentionInput
              value={messageText}
              onChange={setMessageText}
              onMentionsChange={setMentions}
              members={membersList}
              placeholder="Type a message..."
              singleLine
              rows={1}
              maxRows={6}
              className="!rounded-2xl !py-2.5 !px-4 text-base leading-snug placeholder:text-text-light"
              ariaLabel="Message input"
              onSubmit={handleSend}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessage.isPending}
            className="flex items-center justify-center w-10 h-10 bg-forest text-white rounded-full hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

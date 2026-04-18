import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { dbService } from '@/services/firebase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, Button, Modal, Badge, EmptyState, Skeleton } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { Search, Pencil, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { User } from '@/types'

export function UsersPage() {
  const { isAdmin } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => dbService.getAllUsers(),
    enabled: isAdmin
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: User['role'] }) =>
      dbService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showToast('Role updated', 'success')
      setShowRoleModal(false)
      setSelectedUser(null)
    },
    onError: () => {
      showToast('Failed to update role', 'error')
    }
  })

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <EmptyState
          icon="lock"
          title="Access Denied"
          message="You need admin permissions to access this page"
        />
      </div>
    )
  }

  const filteredUsers = users.filter((user: User) => {
    const query = searchQuery.toLowerCase()
    return (
      user.displayName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  })

  const handleRoleChange = (role: User['role']) => {
    if (!selectedUser) return
    updateRoleMutation.mutate({ userId: selectedUser.id, role })
  }

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'error'
      case 'host': return 'warning'
      default: return 'default'
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-forest">Users</h1>
        <p className="text-text-light text-sm">{users.length} members</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm px-4 py-2 mb-4">
        <Search size={20} className="text-text-lighter flex-shrink-0" />
        <input
          type="text"
          className="form-input"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton variant="rectangular" height={70} />
          <Skeleton variant="rectangular" height={70} />
          <Skeleton variant="rectangular" height={70} />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="users"
          title="No users found"
          message={searchQuery ? 'Try a different search term' : 'No users in the system'}
        />
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user: User) => (
            <div key={user.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Avatar src={user.photoURL} name={user.displayName} size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary text-sm">{user.displayName}</h3>
                <p className="text-xs text-text-light">{user.email}</p>
              </div>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUser(user)
                  setShowRoleModal(true)
                }}
              >
                <Pencil size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false)
          setSelectedUser(null)
        }}
        title="Change Role"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-cream">
              <Avatar src={selectedUser.photoURL} name={selectedUser.displayName} size="lg" />
              <div>
                <h3>{selectedUser.displayName}</h3>
                <p>{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                className={cn(
                  'w-full text-left p-3 rounded-md border border-cream hover:border-forest/30 transition-colors cursor-pointer',
                  selectedUser.role === 'member' && 'border-forest bg-forest/5'
                )}
                onClick={() => handleRoleChange('member')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-text-primary">Member</span>
                  {selectedUser.role === 'member' && (
                    <Check size={16} className="text-forest" />
                  )}
                </div>
                <p className="text-sm text-text-light">
                  Can view content, RSVP to events, and participate in groups
                </p>
              </button>

              <button
                className={cn(
                  'w-full text-left p-3 rounded-md border border-cream hover:border-forest/30 transition-colors cursor-pointer',
                  selectedUser.role === 'host' && 'border-forest bg-forest/5'
                )}
                onClick={() => handleRoleChange('host')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-text-primary">Host</span>
                  {selectedUser.role === 'host' && (
                    <Check size={16} className="text-forest" />
                  )}
                </div>
                <p className="text-sm text-text-light">
                  Can create events, manage groups, and write Kete posts
                </p>
              </button>

              <button
                className={cn(
                  'w-full text-left p-3 rounded-md border border-cream hover:border-forest/30 transition-colors cursor-pointer',
                  selectedUser.role === 'admin' && 'border-forest bg-forest/5'
                )}
                onClick={() => handleRoleChange('admin')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-text-primary">Admin</span>
                  {selectedUser.role === 'admin' && (
                    <Check size={16} className="text-forest" />
                  )}
                </div>
                <p className="text-sm text-text-light">
                  Full access to all features including user management
                </p>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

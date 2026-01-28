import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { dbService } from '@/services/firebase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, Button, Modal, Badge, EmptyState, Skeleton } from '@/components/common'
import { useToast } from '@/components/common/Toast'
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
      <div className="users-page">
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
    <div className="users-page">
      <div className="users-header">
        <h1 className="users-title">Users</h1>
        <p className="users-subtitle">{users.length} members</p>
      </div>

      {/* Search */}
      <div className="users-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
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
        <div className="users-list">
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
        <div className="users-list">
          {filteredUsers.map((user: User) => (
            <div key={user.id} className="users-item">
              <Avatar src={user.photoURL} name={user.displayName} size="md" />
              <div className="users-item-info">
                <h3 className="users-item-name">{user.displayName}</h3>
                <p className="users-item-email">{user.email}</p>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
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
          <div className="role-modal-content">
            <div className="role-modal-user">
              <Avatar src={selectedUser.photoURL} name={selectedUser.displayName} size="lg" />
              <div>
                <h3>{selectedUser.displayName}</h3>
                <p>{selectedUser.email}</p>
              </div>
            </div>

            <div className="role-options">
              <button
                className={`role-option ${selectedUser.role === 'member' ? 'active' : ''}`}
                onClick={() => handleRoleChange('member')}
              >
                <div className="role-option-header">
                  <span className="role-option-title">Member</span>
                  {selectedUser.role === 'member' && (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" fill="none" strokeWidth="2" />
                    </svg>
                  )}
                </div>
                <p className="role-option-description">
                  Can view content, RSVP to events, and participate in groups
                </p>
              </button>

              <button
                className={`role-option ${selectedUser.role === 'host' ? 'active' : ''}`}
                onClick={() => handleRoleChange('host')}
              >
                <div className="role-option-header">
                  <span className="role-option-title">Host</span>
                  {selectedUser.role === 'host' && (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" fill="none" strokeWidth="2" />
                    </svg>
                  )}
                </div>
                <p className="role-option-description">
                  Can create events, manage groups, and write Kete posts
                </p>
              </button>

              <button
                className={`role-option ${selectedUser.role === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleChange('admin')}
              >
                <div className="role-option-header">
                  <span className="role-option-title">Admin</span>
                  {selectedUser.role === 'admin' && (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" fill="none" strokeWidth="2" />
                    </svg>
                  )}
                </div>
                <p className="role-option-description">
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

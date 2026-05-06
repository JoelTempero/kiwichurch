import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { dbService, authService } from '@/services/firebase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, Button, Modal, Badge, EmptyState, Spinner, FadeIn } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { Search, Pencil, Check, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { User } from '@/types'

const addUserSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['member', 'host', 'admin']),
})

export function UsersPage() {
  const { isAdmin } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
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

  const addUserForm = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { displayName: '', email: '', password: '', role: 'member' },
  })

  const addUserMutation = useMutation({
    mutationFn: (data: z.infer<typeof addUserSchema>) =>
      authService.adminCreateUser(data.email, data.password, data.displayName, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showToast('User created successfully', 'success')
      setShowAddModal(false)
      addUserForm.reset()
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to create user', 'error')
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display text-forest">Users</h1>
          <p className="text-text-light text-sm">{users.length} members</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} className="mr-1" /> Add User
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 border border-[#e0dbd2] rounded-lg px-4 py-2 mb-4">
        <Search size={20} className="text-text-lighter flex-shrink-0" />
        <input
          type="text"
          className="w-full px-3 py-2 border-none bg-transparent text-base focus:outline-none"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <Spinner />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="users"
          title="No users found"
          message={searchQuery ? 'Try a different search term' : 'No users in the system'}
        />
      ) : (
        <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
          {filteredUsers.map((user: User) => (
            <div key={user.id} className="flex items-center gap-3 p-3">
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
        </FadeIn>
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

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          addUserForm.reset()
        }}
        title="Add User"
      >
        <form onSubmit={addUserForm.handleSubmit((data) => addUserMutation.mutate(data))} className="space-y-4">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium mb-1">Full Name</label>
            <input
              id="add-name"
              type="text"
              className="w-full px-3 py-2 border border-sage-light rounded-md text-base focus:outline-none focus:border-forest"
              placeholder="e.g. John Smith"
              {...addUserForm.register('displayName')}
            />
            {addUserForm.formState.errors.displayName && (
              <span className="text-xs text-red-600 mt-1 block">{addUserForm.formState.errors.displayName.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="add-email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="add-email"
              type="email"
              className="w-full px-3 py-2 border border-sage-light rounded-md text-base focus:outline-none focus:border-forest"
              placeholder="john@example.com"
              {...addUserForm.register('email')}
            />
            {addUserForm.formState.errors.email && (
              <span className="text-xs text-red-600 mt-1 block">{addUserForm.formState.errors.email.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="add-password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="add-password"
              type="text"
              className="w-full px-3 py-2 border border-sage-light rounded-md text-base focus:outline-none focus:border-forest"
              placeholder="Temporary password (min 6 chars)"
              {...addUserForm.register('password')}
            />
            {addUserForm.formState.errors.password && (
              <span className="text-xs text-red-600 mt-1 block">{addUserForm.formState.errors.password.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="add-role" className="block text-sm font-medium mb-1">Role</label>
            <select
              id="add-role"
              className="w-full px-3 py-2 border border-sage-light rounded-md text-base focus:outline-none focus:border-forest"
              {...addUserForm.register('role')}
            >
              <option value="member">Member</option>
              <option value="host">Host</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={addUserMutation.isPending}
          >
            {addUserMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}

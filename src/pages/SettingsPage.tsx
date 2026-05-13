import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { dbService, authService } from '@/services/firebase'
import { useGatherings } from '@/hooks/useGatherings'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, Button, Modal, Badge, EmptyState, Spinner, FadeIn } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { Search, Pencil, Check, Plus, Calendar, BookMarked, Shield, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/utils/webNotifications'
import type { User } from '@/types'

const addUserSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['member', 'host', 'admin']),
})

const editUserSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  role: z.enum(['member', 'host', 'admin']),
  canPostKete: z.boolean(),
  hostedGatherings: z.array(z.string()).default([]),
})

const inputBase = 'w-full px-3 py-2 border border-sage-light rounded-md text-base focus:outline-none focus:border-forest'

export function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  )

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleForceRefresh = async () => {
    setIsRefreshing(true)
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((r) => r.unregister()))
      }
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
    } catch (err) {
      console.error('[settings] force-refresh failed', err)
    }
    window.location.reload()
  }

  useEffect(() => {
    setNotifPermission(getNotificationPermission())
  }, [])

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => dbService.getAllUsers(),
    enabled: isAdmin,
  })

  const { data: allGatherings = [] } = useGatherings()

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<User> }) =>
      dbService.updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showToast('User updated', 'success')
      setShowEditModal(false)
      setShowRoleModal(false)
      setSelectedUser(null)
    },
    onError: () => {
      showToast('Failed to update user', 'error')
    },
  })

  const addUserForm = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { displayName: '', email: '', password: '', role: 'member' },
  })

  const editUserForm = useForm<z.input<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
  })

  const addUserMutation = useMutation({
    mutationFn: (data: z.infer<typeof addUserSchema>) =>
      authService.adminCreateUser(data.email, data.password, data.displayName, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showToast('User created', 'success')
      setShowAddModal(false)
      addUserForm.reset()
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to create user', 'error')
    },
  })

  if (!user) {
    return (
      <div className="max-w-[600px] mx-auto p-4">
        <EmptyState icon="settings" title="Not signed in" message="Please sign in to access settings" />
      </div>
    )
  }

  const notifEnabled = notifPermission === 'granted'
  const notifBlocked = notifPermission === 'denied'
  const notifUnsupported = notifPermission === 'unsupported'

  // Show pending self-signups first so admins can approve quickly.
  const sortedUsers = [...users].sort((a, b) => {
    const aPending = a.status === 'pending' ? 0 : 1
    const bPending = b.status === 'pending' ? 0 : 1
    if (aPending !== bPending) return aPending - bPending
    return a.displayName.localeCompare(b.displayName)
  })
  const filteredUsers = sortedUsers.filter((u: User) => {
    const q = searchQuery.toLowerCase()
    return u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const handleApproveUser = (u: User) => {
    updateUserMutation.mutate({ userId: u.id, updates: { status: 'active' } })
  }

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'error'
      case 'host': return 'warning'
      default: return 'default'
    }
  }

  const handleRoleChange = (role: User['role']) => {
    if (!selectedUser) return
    updateUserMutation.mutate({ userId: selectedUser.id, updates: { role } })
  }

  const openEditModal = (u: User) => {
    setSelectedUser(u)
    editUserForm.reset({
      displayName: u.displayName,
      phone: u.phone || '',
      bio: u.bio || '',
      role: u.role,
      canPostKete: u.canPostKete === true,
      hostedGatherings: u.hostedGatherings || [],
    })
    setShowEditModal(true)
  }

  const handleEditUser = editUserForm.handleSubmit(async (data) => {
    if (!selectedUser) return
    // Only persist hostedGatherings for the host role — clearing it when
    // someone is demoted to member or promoted to admin keeps the data
    // honest (admin already has full access).
    const hostedGatherings: string[] = data.role === 'host' ? (data.hostedGatherings ?? []) : []
    updateUserMutation.mutate({
      userId: selectedUser.id,
      updates: {
        displayName: data.displayName.trim(),
        phone: data.phone?.trim() || '',
        bio: data.bio?.trim() || '',
        role: data.role,
        canPostKete: data.canPostKete,
        hostedGatherings,
      },
    })

    // Mirror host assignments into actual group memberships so the host
    // also shows up under "My Groups" and can read private board posts.
    // Idempotent; un-assigning doesn't remove existing memberships (host
    // may have been a regular member separately — they can leave manually).
    if (hostedGatherings.length > 0) {
      try {
        await dbService.ensureMembershipsForUser(selectedUser.id, hostedGatherings)
      } catch (err) {
        console.error('[Settings] Failed to mirror host memberships', err)
      }
    }
  })

  // Watch role + hostedGatherings so the picker appears as soon as
  // the admin sets the role to "host" in the edit modal.
  const editRole = editUserForm.watch('role')
  const editHostedGatherings = editUserForm.watch('hostedGatherings') || []
  const toggleHostedGathering = (id: string) => {
    const set = new Set(editHostedGatherings)
    if (set.has(id)) set.delete(id); else set.add(id)
    editUserForm.setValue('hostedGatherings', Array.from(set), { shouldDirty: true })
  }

  return (
    <div className="max-w-[600px] mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-forest">Settings</h1>
      </div>

      {/* Notifications */}
      <section className="mb-6">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Notifications</p>
        <div className="flex items-center justify-between py-3 border-b border-[#e0dbd2]">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary">Browser Notifications</h3>
            <p className="text-xs text-text-light mt-0.5">
              {notifUnsupported
                ? 'Not supported in this browser'
                : notifEnabled
                  ? "You'll get notified of new messages and mentions"
                  : notifBlocked
                    ? "Blocked by browser — update in your browser's site settings"
                    : 'Get notified when you receive messages'}
            </p>
          </div>
          <label className={`relative inline-flex items-center ${notifBlocked || notifUnsupported ? 'opacity-50' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={notifEnabled}
              disabled={notifBlocked || notifUnsupported}
              onChange={async () => {
                if (!notifEnabled && !notifBlocked) {
                  const result = await requestNotificationPermission()
                  setNotifPermission(result)
                  if (result === 'granted') {
                    showToast('Notifications enabled', 'success')
                  }
                }
              }}
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-forest/30 rounded-full peer-checked:bg-forest transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>
      </section>

      {/* App */}
      <section className="mb-6">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">App</p>
        <div className="flex items-center justify-between py-3 border-b border-[#e0dbd2]">
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-semibold text-text-primary">Force refresh</h3>
            <p className="text-xs text-text-light mt-0.5">
              Clears the cache and reloads. Use if the app feels stuck on an old version after a deploy.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={cn('mr-1.5', isRefreshing && 'animate-spin')} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </section>

      {/* Admin: Users */}
      {isAdmin && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta">
              Users {users.length > 0 && <span className="text-text-lighter">({users.length})</span>}
            </p>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>

          <div className="flex items-center gap-3 border border-[#e0dbd2] rounded-lg px-3 py-1.5 mb-3">
            <Search size={16} className="text-text-lighter flex-shrink-0" />
            <input
              type="text"
              className="w-full px-2 py-1 border-none bg-transparent text-sm focus:outline-none"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {usersLoading ? (
            <Spinner />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon="users"
              title="No users found"
              message={searchQuery ? 'Try a different search term' : 'No users in the system'}
            />
          ) : (
            <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
              {filteredUsers.map((u: User) => {
                const isPending = u.status === 'pending'
                return (
                  <div key={u.id} className={`flex items-center gap-3 p-3 ${isPending ? 'bg-amber-50' : ''}`}>
                    <Avatar src={u.photoURL} name={u.displayName} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary text-sm">{u.displayName}</h3>
                      <p className="text-xs text-text-light truncate">{u.email}</p>
                    </div>
                    {isPending && (
                      <Badge variant="warning">Pending</Badge>
                    )}
                    {!isPending && (
                      <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>
                    )}
                    {isPending && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveUser(u)}
                        disabled={updateUserMutation.isPending}
                        aria-label={`Approve ${u.displayName}`}
                      >
                        Approve
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(u)} aria-label={`Edit ${u.displayName}`}>
                      <Pencil size={16} />
                    </Button>
                  </div>
                )
              })}
            </FadeIn>
          )}
        </section>
      )}

      {/* Admin: Links */}
      {isAdmin && (
        <section className="mb-6">
          <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Admin</p>
          <div className="space-y-1">
            <a href="/hosting" className="flex items-center gap-3 py-3 border-b border-[#e0dbd2] hover:bg-cream/50 transition-colors text-text-primary no-underline">
              <Calendar size={20} />
              Content Hosting
            </a>
            <a href="/directory" className="flex items-center gap-3 py-3 border-b border-[#e0dbd2] hover:bg-cream/50 transition-colors text-text-primary no-underline">
              <BookMarked size={20} />
              Member Directory
            </a>
            <a href="/moderation" className="flex items-center gap-3 py-3 border-b border-[#e0dbd2] hover:bg-cream/50 transition-colors text-text-primary no-underline">
              <Shield size={20} />
              Moderation
            </a>
          </div>
        </section>
      )}

      {/* About */}
      <section className="mb-6">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">About</p>
        <div className="py-2">
          <p className="font-semibold text-text-primary">Kiwi Church Portal</p>
          <p className="text-sm text-text-lighter">Version 2.0.0</p>
        </div>
      </section>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedUser(null) }}
        title="Edit User"
      >
        {selectedUser && (
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-cream">
              <Avatar src={selectedUser.photoURL} name={selectedUser.displayName} size="lg" />
              <div>
                <p className="text-sm text-text-light">{selectedUser.email}</p>
              </div>
            </div>

            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium mb-1">Display Name</label>
              <input id="edit-name" type="text" className={inputBase} {...editUserForm.register('displayName')} />
              {editUserForm.formState.errors.displayName && (
                <span className="text-xs text-red-600 mt-1 block">{editUserForm.formState.errors.displayName.message}</span>
              )}
            </div>

            <div>
              <label htmlFor="edit-phone" className="block text-sm font-medium mb-1">Phone</label>
              <input id="edit-phone" type="tel" className={inputBase} placeholder="+64 21 123 4567" {...editUserForm.register('phone')} />
            </div>

            <div>
              <label htmlFor="edit-bio" className="block text-sm font-medium mb-1">Bio</label>
              <textarea id="edit-bio" className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3} {...editUserForm.register('bio')} />
            </div>

            <div>
              <label htmlFor="edit-role" className="block text-sm font-medium mb-1">Role</label>
              <select id="edit-role" className={inputBase} {...editUserForm.register('role')}>
                <option value="member">Member</option>
                <option value="host">Host</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {editRole === 'host' && (
              <div>
                <p className="text-sm font-medium mb-1">Hosts which groups?</p>
                <p className="text-xs text-text-light mb-2">
                  This host will only see Hosting for these groups and can only create events for them. Admins host everything.
                </p>
                {allGatherings.length === 0 ? (
                  <p className="text-xs text-text-lighter italic">No groups yet — create one first.</p>
                ) : (
                  <div className="border border-[#e0dbd2] rounded-md divide-y divide-[#ebe6dc] max-h-[200px] overflow-y-auto">
                    {allGatherings.map((g) => {
                      const checked = editHostedGatherings.includes(g.id)
                      return (
                        <label
                          key={g.id}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-cream/40 transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="w-[16px] h-[16px] accent-forest"
                            checked={checked}
                            onChange={() => toggleHostedGathering(g.id)}
                          />
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: g.color || '#2d5a4a' }}
                            aria-hidden
                          />
                          <span className="text-sm text-text-primary flex-1">{g.name}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-[18px] h-[18px] accent-forest"
                  {...editUserForm.register('canPostKete')}
                />
                <span className="text-sm">Can post Kete</span>
              </label>
              <span className="text-xs text-text-light mt-1 block">
                Lets this member create and edit their own Kete posts. Admin/host always can.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" className="flex-1" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowEditModal(false); setSelectedUser(null) }}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Role Quick-Change Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => { setShowRoleModal(false); setSelectedUser(null) }}
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
              {(['member', 'host', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  className={cn(
                    'w-full text-left p-3 rounded-md border border-cream hover:border-forest/30 transition-colors cursor-pointer',
                    selectedUser.role === role && 'border-forest bg-forest/5'
                  )}
                  onClick={() => handleRoleChange(role)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-text-primary capitalize">{role}</span>
                    {selectedUser.role === role && <Check size={16} className="text-forest" />}
                  </div>
                  <p className="text-sm text-text-light">
                    {role === 'member' && 'Can view content, RSVP to events, and participate in groups'}
                    {role === 'host' && 'Can create events, manage groups, and write Kete posts'}
                    {role === 'admin' && 'Full access to all features including user management'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); addUserForm.reset() }}
        title="Add User"
      >
        <form onSubmit={addUserForm.handleSubmit((data) => addUserMutation.mutate(data))} className="space-y-4">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium mb-1">Full Name</label>
            <input id="add-name" type="text" className={inputBase} placeholder="e.g. John Smith" {...addUserForm.register('displayName')} />
            {addUserForm.formState.errors.displayName && (
              <span className="text-xs text-red-600 mt-1 block">{addUserForm.formState.errors.displayName.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="add-email" className="block text-sm font-medium mb-1">Email</label>
            <input id="add-email" type="email" className={inputBase} placeholder="john@example.com" {...addUserForm.register('email')} />
            {addUserForm.formState.errors.email && (
              <span className="text-xs text-red-600 mt-1 block">{addUserForm.formState.errors.email.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="add-password" className="block text-sm font-medium mb-1">Password</label>
            <input id="add-password" type="text" className={inputBase} placeholder="Temporary password (min 6 chars)" {...addUserForm.register('password')} />
            {addUserForm.formState.errors.password && (
              <span className="text-xs text-red-600 mt-1 block">{addUserForm.formState.errors.password.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="add-role" className="block text-sm font-medium mb-1">Role</label>
            <select id="add-role" className={inputBase} {...addUserForm.register('role')}>
              <option value="member">Member</option>
              <option value="host">Host</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={addUserMutation.isPending}>
            {addUserMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}

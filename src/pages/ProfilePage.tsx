import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Button, Modal } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { storageService } from '@/services/firebase'
import { Camera, Pencil, Lock, LogOut, Loader2 } from 'lucide-react'
import { profileSchema, passwordSchema } from '@/utils/schemas'
import type { ProfileInput, PasswordInput } from '@/utils/schemas'
import { cn } from '@/utils/cn'

const inputBase = 'w-full px-3 py-3 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest'
const inputError = 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'

export function ProfilePage() {
  const { user, signOut, updateProfile, updatePassword } = useAuth()
  const { showToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: user?.displayName || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  })

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const handleSaveProfile = profileForm.handleSubmit(async (data) => {
    try {
      await updateProfile({ displayName: data.displayName.trim(), phone: data.phone.trim(), bio: (data.bio || '').trim() })
      setIsEditing(false)
      showToast('Profile updated', 'success')
    } catch {
      showToast('Failed to update profile', 'error')
    }
  })

  const handleChangePassword = passwordForm.handleSubmit(async (data) => {
    try {
      await updatePassword(data.currentPassword, data.newPassword)
      setIsChangingPassword(false)
      passwordForm.reset()
      showToast('Password updated', 'success')
    } catch (error) {
      if (error instanceof Error && error.message.includes('wrong-password')) {
        passwordForm.setError('currentPassword', { message: 'Current password is incorrect' })
      } else {
        showToast(error instanceof Error ? error.message : 'Failed to update password', 'error')
      }
    }
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error')
      return
    }

    setIsUploading(true)
    try {
      const result = await storageService.uploadProfileImage(user.id, file)
      await updateProfile({ photoURL: result.url })
      showToast('Photo updated', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to upload photo', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      showToast('Failed to sign out', 'error')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    profileForm.reset()
  }

  const handleClosePasswordModal = () => {
    setIsChangingPassword(false)
    passwordForm.reset()
  }

  if (!user) return null

  return (
    <div className="max-w-[600px] mx-auto p-4">
      {/* Profile Header */}
      <div className="text-center mb-8 pt-4">
        <div className="relative inline-block mb-4">
          <Avatar src={user.photoURL} name={user.displayName} size="xl" />
          <label className="absolute bottom-0 right-0 cursor-pointer" aria-label="Upload profile photo">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isUploading}
              hidden
              aria-describedby="photo-upload-hint"
            />
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-forest text-white hover:bg-forest-light transition-colors" role="button" aria-label="Upload photo">
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" aria-label="Uploading..." />
              ) : (
                <Camera size={16} aria-hidden="true" />
              )}
            </span>
          </label>
          <span id="photo-upload-hint" className="sr-only">
            Max file size: 5MB. Accepted formats: JPG, PNG, GIF
          </span>
        </div>
        <h1 className="text-2xl font-display text-forest mb-1">{user.displayName}</h1>
        <p className="text-text-light text-sm mb-2">{user.email}</p>
        {user.role !== 'member' && (
          <span className="inline-block text-xs font-semibold text-terracotta bg-terracotta/10 px-3 py-1 rounded-full uppercase">{user.role}</span>
        )}
      </div>

      {/* Profile Info */}
      {!isEditing ? (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">About</p>
          <div className="border-b border-[#e0dbd2] pb-4 mb-4">
            {user.bio ? (
              <p className="text-text-primary leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-text-lighter italic">No bio added yet</p>
            )}
          </div>

          <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Contact</p>
          <div className="flex justify-between py-2 border-b border-[#e0dbd2]">
            <span className="text-text-light text-sm">Email</span>
            <span className="text-text-primary text-sm font-medium">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex justify-between py-2 border-b border-[#e0dbd2]">
              <span className="text-text-light text-sm">Phone</span>
              <span className="text-text-primary text-sm font-medium">{user.phone}</span>
            </div>
          )}

          <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3 mt-6">Account</p>
          <div className="flex justify-between py-2 border-b border-[#e0dbd2]">
            <span className="text-text-light text-sm">Role</span>
            <span className="text-text-primary text-sm font-medium capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#e0dbd2]">
            <span className="text-text-light text-sm">Member since</span>
            <span className="text-text-primary text-sm font-medium">
              {user.createdAt && 'toDate' in user.createdAt
                ? user.createdAt.toDate().toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })
                : user.createdAt instanceof Date
                  ? user.createdAt.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })
                  : '—'}
            </span>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              <Pencil size={18} aria-hidden="true" />
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              <Lock size={18} aria-hidden="true" />
              Change Password
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="mb-4 space-y-4" noValidate>
          <div>
            <label className="block font-medium mb-2" htmlFor="profile-name">
              Display Name <span className="text-red-600">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              className={cn(inputBase, profileForm.formState.errors.displayName && inputError)}
              aria-invalid={!!profileForm.formState.errors.displayName}
              aria-describedby={profileForm.formState.errors.displayName ? 'name-error' : undefined}
              {...profileForm.register('displayName')}
            />
            {profileForm.formState.errors.displayName && (
              <span id="name-error" className="text-sm text-red-600 mt-1 block" role="alert">
                {profileForm.formState.errors.displayName.message}
              </span>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="profile-phone">
              Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              className={cn(inputBase, profileForm.formState.errors.phone && inputError)}
              placeholder="+64 21 123 4567"
              aria-invalid={!!profileForm.formState.errors.phone}
              aria-describedby={profileForm.formState.errors.phone ? 'phone-error' : 'phone-hint'}
              {...profileForm.register('phone')}
            />
            {profileForm.formState.errors.phone ? (
              <span id="phone-error" className="text-sm text-red-600 mt-1 block" role="alert">
                {profileForm.formState.errors.phone.message}
              </span>
            ) : (
              <span id="phone-hint" className="text-sm text-text-light mt-1 block">Optional - visible to other members</span>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="profile-bio">
              Bio
            </label>
            <textarea
              id="profile-bio"
              className={cn(inputBase, 'resize-y min-h-[100px]')}
              placeholder="Tell us a bit about yourself"
              rows={4}
              aria-describedby="bio-hint"
              {...profileForm.register('bio')}
            />
            <span id="bio-hint" className="text-sm text-text-light mt-1 block">Optional - share a little about yourself</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={profileForm.formState.isSubmitting}>
              Save Changes
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancelEdit} disabled={profileForm.formState.isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Sign Out */}
      <div className="text-center py-8">
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut size={18} aria-hidden="true" />
          Sign Out
        </Button>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangingPassword}
        onClose={handleClosePasswordModal}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
          <div>
            <label className="block font-medium mb-2" htmlFor="current-password">
              Current Password <span className="text-red-600">*</span>
            </label>
            <input
              id="current-password"
              type="password"
              className={cn(inputBase, passwordForm.formState.errors.currentPassword && inputError)}
              autoComplete="current-password"
              aria-invalid={!!passwordForm.formState.errors.currentPassword}
              aria-describedby={passwordForm.formState.errors.currentPassword ? 'current-password-error' : undefined}
              {...passwordForm.register('currentPassword')}
            />
            {passwordForm.formState.errors.currentPassword && (
              <span id="current-password-error" className="text-sm text-red-600 mt-1 block" role="alert">
                {passwordForm.formState.errors.currentPassword.message}
              </span>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="new-password">
              New Password <span className="text-red-600">*</span>
            </label>
            <input
              id="new-password"
              type="password"
              className={cn(inputBase, passwordForm.formState.errors.newPassword && inputError)}
              autoComplete="new-password"
              aria-invalid={!!passwordForm.formState.errors.newPassword}
              aria-describedby={passwordForm.formState.errors.newPassword ? 'new-password-error' : 'new-password-hint'}
              {...passwordForm.register('newPassword')}
            />
            {passwordForm.formState.errors.newPassword ? (
              <span id="new-password-error" className="text-sm text-red-600 mt-1 block" role="alert">
                {passwordForm.formState.errors.newPassword.message}
              </span>
            ) : (
              <span id="new-password-hint" className="text-sm text-text-light mt-1 block">Must be at least 6 characters</span>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="confirm-password">
              Confirm New Password <span className="text-red-600">*</span>
            </label>
            <input
              id="confirm-password"
              type="password"
              className={cn(inputBase, passwordForm.formState.errors.confirmPassword && inputError)}
              autoComplete="new-password"
              aria-invalid={!!passwordForm.formState.errors.confirmPassword}
              aria-describedby={passwordForm.formState.errors.confirmPassword ? 'confirm-password-error' : undefined}
              {...passwordForm.register('confirmPassword')}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <span id="confirm-password-error" className="text-sm text-red-600 mt-1 block" role="alert">
                {passwordForm.formState.errors.confirmPassword.message}
              </span>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" loading={passwordForm.formState.isSubmitting}>
              Update Password
            </Button>
            <Button type="button" variant="ghost" onClick={handleClosePasswordModal} disabled={passwordForm.formState.isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

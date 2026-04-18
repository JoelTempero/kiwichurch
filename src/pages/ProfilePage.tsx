import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Button, Modal } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { storageService } from '@/services/firebase'
import { Camera, Pencil, Lock, LogOut, Loader2 } from 'lucide-react'

interface ProfileFormErrors {
  displayName?: string
  phone?: string
}

interface PasswordFormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function ProfilePage() {
  const { user, signOut, updateProfile, updatePassword } = useAuth()
  const { showToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({})

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({})

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setPhone(user.phone || '')
      setBio(user.bio || '')
    }
  }, [user])

  // Reset form when editing is cancelled
  useEffect(() => {
    if (!isEditing && user) {
      setDisplayName(user.displayName || '')
      setPhone(user.phone || '')
      setBio(user.bio || '')
      setProfileErrors({})
    }
  }, [isEditing, user])

  // Reset password form when modal closes
  useEffect(() => {
    if (!isChangingPassword) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordErrors({})
    }
  }, [isChangingPassword])

  const validateProfileForm = (): boolean => {
    const errors: ProfileFormErrors = {}

    if (!displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters'
    }

    if (phone && !/^[\d\s\-+()]*$/.test(phone)) {
      errors.phone = 'Please enter a valid phone number'
    }

    setProfileErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePasswordForm = (): boolean => {
    const errors: PasswordFormErrors = {}

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required'
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required'
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProfileForm()) return

    setIsSaving(true)
    try {
      await updateProfile({ displayName: displayName.trim(), phone: phone.trim(), bio: bio.trim() })
      setIsEditing(false)
      showToast('Profile updated', 'success')
    } catch (error) {
      showToast('Failed to update profile', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswordForm()) return

    setIsSaving(true)
    try {
      await updatePassword(currentPassword, newPassword)
      setIsChangingPassword(false)
      showToast('Password updated', 'success')
    } catch (error) {
      if (error instanceof Error && error.message.includes('wrong-password')) {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' })
      } else {
        showToast(error instanceof Error ? error.message : 'Failed to update password', 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    // Validate file size (max 5MB)
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
    } catch (error) {
      showToast('Failed to sign out', 'error')
    }
  }

  const clearFieldError = (field: keyof ProfileFormErrors) => {
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const clearPasswordFieldError = (field: keyof PasswordFormErrors) => {
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: undefined }))
    }
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
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-forest text-white shadow-sm hover:bg-forest-light transition-colors" role="button" aria-label="Upload photo">
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="mb-6 last:mb-0">
            <h2 className="text-lg font-display text-forest mb-3">About</h2>
            {user.bio ? (
              <p className="text-text-primary leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-text-lighter italic">No bio added yet</p>
            )}
          </div>

          <div className="mb-6 last:mb-0">
            <h2 className="text-lg font-display text-forest mb-3">Contact</h2>
            <div className="flex justify-between py-2 border-b border-cream last:border-none">
              <span className="text-text-light text-sm">Email</span>
              <span className="text-text-primary text-sm font-medium">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex justify-between py-2 border-b border-cream last:border-none">
                <span className="text-text-light text-sm">Phone</span>
                <span className="text-text-primary text-sm font-medium">{user.phone}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
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
        <form onSubmit={handleSaveProfile} className="bg-white rounded-lg shadow-sm p-6 mb-4 space-y-4" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">
              Display Name <span className="form-required">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              className={`form-input ${profileErrors.displayName ? 'form-input-error' : ''}`}
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                clearFieldError('displayName')
              }}
              aria-invalid={!!profileErrors.displayName}
              aria-describedby={profileErrors.displayName ? 'name-error' : undefined}
              required
            />
            {profileErrors.displayName && (
              <span id="name-error" className="form-error" role="alert">
                {profileErrors.displayName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-phone">
              Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              className={`form-input ${profileErrors.phone ? 'form-input-error' : ''}`}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                clearFieldError('phone')
              }}
              placeholder="+64 21 123 4567"
              aria-invalid={!!profileErrors.phone}
              aria-describedby={profileErrors.phone ? 'phone-error' : 'phone-hint'}
            />
            {profileErrors.phone ? (
              <span id="phone-error" className="form-error" role="alert">
                {profileErrors.phone}
              </span>
            ) : (
              <span id="phone-hint" className="form-hint">Optional - visible to other members</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-bio">
              Bio
            </label>
            <textarea
              id="profile-bio"
              className="form-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself"
              rows={4}
              aria-describedby="bio-hint"
            />
            <span id="bio-hint" className="form-hint">Optional - share a little about yourself</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={isSaving}>
              Save Changes
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
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
        onClose={() => setIsChangingPassword(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="current-password">
              Current Password <span className="form-required">*</span>
            </label>
            <input
              id="current-password"
              type="password"
              className={`form-input ${passwordErrors.currentPassword ? 'form-input-error' : ''}`}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                clearPasswordFieldError('currentPassword')
              }}
              autoComplete="current-password"
              aria-invalid={!!passwordErrors.currentPassword}
              aria-describedby={passwordErrors.currentPassword ? 'current-password-error' : undefined}
              required
            />
            {passwordErrors.currentPassword && (
              <span id="current-password-error" className="form-error" role="alert">
                {passwordErrors.currentPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">
              New Password <span className="form-required">*</span>
            </label>
            <input
              id="new-password"
              type="password"
              className={`form-input ${passwordErrors.newPassword ? 'form-input-error' : ''}`}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                clearPasswordFieldError('newPassword')
              }}
              autoComplete="new-password"
              aria-invalid={!!passwordErrors.newPassword}
              aria-describedby={passwordErrors.newPassword ? 'new-password-error' : 'new-password-hint'}
              required
            />
            {passwordErrors.newPassword ? (
              <span id="new-password-error" className="form-error" role="alert">
                {passwordErrors.newPassword}
              </span>
            ) : (
              <span id="new-password-hint" className="form-hint">Must be at least 6 characters</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">
              Confirm New Password <span className="form-required">*</span>
            </label>
            <input
              id="confirm-password"
              type="password"
              className={`form-input ${passwordErrors.confirmPassword ? 'form-input-error' : ''}`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                clearPasswordFieldError('confirmPassword')
              }}
              autoComplete="new-password"
              aria-invalid={!!passwordErrors.confirmPassword}
              aria-describedby={passwordErrors.confirmPassword ? 'confirm-password-error' : undefined}
              required
            />
            {passwordErrors.confirmPassword && (
              <span id="confirm-password-error" className="form-error" role="alert">
                {passwordErrors.confirmPassword}
              </span>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" loading={isSaving}>
              Update Password
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsChangingPassword(false)} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

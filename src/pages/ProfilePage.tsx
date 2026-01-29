import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Button, Modal } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { storageService } from '@/services/firebase'

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
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <Avatar src={user.photoURL} name={user.displayName} size="xl" />
          <label className="profile-avatar-upload" aria-label="Upload profile photo">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isUploading}
              hidden
              aria-describedby="photo-upload-hint"
            />
            <span className="profile-avatar-upload-btn" role="button" aria-label="Upload photo">
              {isUploading ? (
                <div className="loading-spinner" style={{ width: 16, height: 16 }} aria-label="Uploading..." />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </span>
          </label>
          <span id="photo-upload-hint" className="sr-only">
            Max file size: 5MB. Accepted formats: JPG, PNG, GIF
          </span>
        </div>
        <h1 className="profile-name">{user.displayName}</h1>
        <p className="profile-email">{user.email}</p>
        {user.role !== 'member' && (
          <span className="profile-role-badge">{user.role}</span>
        )}
      </div>

      {/* Profile Info */}
      {!isEditing ? (
        <div className="profile-info">
          <div className="profile-section">
            <h2 className="profile-section-title">About</h2>
            {user.bio ? (
              <p className="profile-bio">{user.bio}</p>
            ) : (
              <p className="profile-bio-empty">No bio added yet</p>
            )}
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">Contact</h2>
            <div className="profile-field">
              <span className="profile-field-label">Email</span>
              <span className="profile-field-value">{user.email}</span>
            </div>
            {user.phone && (
              <div className="profile-field">
                <span className="profile-field-label">Phone</span>
                <span className="profile-field-value">{user.phone}</span>
              </div>
            )}
          </div>

          <div className="profile-actions">
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Change Password
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="profile-edit-form" noValidate>
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

          <div className="profile-edit-actions">
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
      <div className="profile-sign-out">
        <Button variant="ghost" onClick={handleSignOut}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
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

          <div className="modal-actions">
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

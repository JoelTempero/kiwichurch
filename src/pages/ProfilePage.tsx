import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Button, Modal } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { storageService } from '@/services/firebase'

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

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateProfile({ displayName, phone, bio })
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
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }

    setIsSaving(true)
    try {
      await updatePassword(currentPassword, newPassword)
      setIsChangingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update password', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

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

  if (!user) return null

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <Avatar src={user.photoURL} name={user.displayName} size="xl" />
          <label className="profile-avatar-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isUploading}
              hidden
            />
            <span className="profile-avatar-upload-btn">
              {isUploading ? (
                <div className="loading-spinner" style={{ width: 16, height: 16 }} />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </span>
          </label>
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
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              Change Password
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="profile-edit-form">
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="form-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself"
              rows={4}
            />
          </div>

          <div className="profile-edit-actions">
            <Button type="submit" variant="primary" loading={isSaving}>
              Save Changes
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Sign Out */}
      <div className="profile-sign-out">
        <Button variant="ghost" onClick={handleSignOut}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
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
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <Button type="submit" variant="primary" loading={isSaving}>
              Update Password
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsChangingPassword(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

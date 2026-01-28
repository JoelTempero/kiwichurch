import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  listAll,
  type UploadTaskSnapshot
} from 'firebase/storage'
import { storage } from './config'

export interface UploadResult {
  path: string
  url: string
  fileName: string
  contentType: string
  size: number
}

export type ProgressCallback = (progress: number, state: string) => void

// Validation helpers
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const VALID_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()?.toLowerCase() || 'file'
  return `${timestamp}-${random}.${ext}`
}

function isValidImage(file: File): boolean {
  return VALID_IMAGE_TYPES.includes(file.type)
}

function isValidDocument(file: File): boolean {
  return VALID_DOCUMENT_TYPES.includes(file.type)
}

function isValidSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024
}

function formatError(error: unknown): Error {
  if (error instanceof Error && 'code' in error) {
    const code = (error as { code: string }).code
    const messages: Record<string, string> = {
      'storage/unauthorized': "You don't have permission to upload files",
      'storage/canceled': 'Upload was cancelled',
      'storage/unknown': 'An unknown error occurred',
      'storage/object-not-found': 'File not found',
      'storage/quota-exceeded': 'Storage quota exceeded'
    }
    return new Error(messages[code] || error.message)
  }
  return error instanceof Error ? error : new Error('An unexpected error occurred')
}

export const storageService = {
  // ============================================
  // UPLOAD HELPERS
  // ============================================

  generateFileName,
  isValidImage,
  isValidDocument,
  isValidSize,

  // ============================================
  // PROFILE IMAGES
  // ============================================

  async uploadProfileImage(userId: string, file: File, onProgress?: ProgressCallback): Promise<UploadResult> {
    if (!isValidImage(file)) {
      throw new Error('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
    }
    if (!isValidSize(file, 5)) {
      throw new Error('Image must be smaller than 5MB')
    }

    const fileName = generateFileName(file.name)
    const path = `users/${userId}/profile/${fileName}`
    return this.uploadFile(path, file, onProgress)
  },

  async deleteProfileImage(userId: string, fileName: string): Promise<void> {
    const path = `users/${userId}/profile/${fileName}`
    return this.deleteFile(path)
  },

  // ============================================
  // KETE (BLOG) IMAGES
  // ============================================

  async uploadKeteImage(postId: string, file: File, onProgress?: ProgressCallback): Promise<UploadResult> {
    if (!isValidImage(file)) {
      throw new Error('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
    }
    if (!isValidSize(file, 10)) {
      throw new Error('Image must be smaller than 10MB')
    }

    const fileName = generateFileName(file.name)
    const path = `kete/${postId}/${fileName}`
    return this.uploadFile(path, file, onProgress)
  },

  async deleteKeteImage(postId: string, fileName: string): Promise<void> {
    const path = `kete/${postId}/${fileName}`
    return this.deleteFile(path)
  },

  // ============================================
  // EVENT IMAGES
  // ============================================

  async uploadEventImage(eventId: string, file: File, onProgress?: ProgressCallback): Promise<UploadResult> {
    if (!isValidImage(file)) {
      throw new Error('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
    }
    if (!isValidSize(file, 10)) {
      throw new Error('Image must be smaller than 10MB')
    }

    const fileName = generateFileName(file.name)
    const path = `events/${eventId}/${fileName}`
    return this.uploadFile(path, file, onProgress)
  },

  // ============================================
  // GATHERING IMAGES
  // ============================================

  async uploadGatheringImage(gatheringId: string, file: File, onProgress?: ProgressCallback): Promise<UploadResult> {
    if (!isValidImage(file)) {
      throw new Error('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
    }
    if (!isValidSize(file, 10)) {
      throw new Error('Image must be smaller than 10MB')
    }

    const fileName = generateFileName(file.name)
    const path = `gatherings/${gatheringId}/${fileName}`
    return this.uploadFile(path, file, onProgress)
  },

  // ============================================
  // MESSAGE BOARD ATTACHMENTS
  // ============================================

  async uploadBoardAttachment(
    boardId: string,
    postId: string,
    file: File,
    onProgress?: ProgressCallback
  ): Promise<UploadResult> {
    if (!isValidImage(file) && !isValidDocument(file)) {
      throw new Error('Please upload an image or document (PDF, DOC)')
    }
    if (!isValidSize(file, 25)) {
      throw new Error('File must be smaller than 25MB')
    }

    const fileName = generateFileName(file.name)
    const path = `messageBoards/${boardId}/posts/${postId}/${fileName}`
    return this.uploadFile(path, file, onProgress)
  },

  // ============================================
  // SHARED RESOURCES
  // ============================================

  async uploadResource(file: File, onProgress?: ProgressCallback): Promise<UploadResult> {
    if (!isValidImage(file) && !isValidDocument(file)) {
      throw new Error('Please upload an image or document (PDF, DOC)')
    }
    if (!isValidSize(file, 50)) {
      throw new Error('File must be smaller than 50MB')
    }

    const fileName = generateFileName(file.name)
    const path = `resources/${fileName}`
    return this.uploadFile(path, file, onProgress)
  },

  // ============================================
  // TEMPORARY UPLOADS
  // ============================================

  async uploadTemp(userId: string, file: File, onProgress?: ProgressCallback): Promise<UploadResult> {
    if (!isValidSize(file, 25)) {
      throw new Error('File must be smaller than 25MB')
    }

    const fileName = generateFileName(file.name)
    const path = `temp/${userId}/${fileName}`
    return this.uploadFile(path, file, onProgress)
  },

  async clearTempFiles(userId: string): Promise<boolean> {
    try {
      const listRef = ref(storage, `temp/${userId}`)
      const result = await listAll(listRef)
      const deletePromises = result.items.map(item => deleteObject(item))
      await Promise.all(deletePromises)
      return true
    } catch (error) {
      console.error('[Storage] Clear temp error:', error)
      return false
    }
  },

  // ============================================
  // CORE UPLOAD/DOWNLOAD
  // ============================================

  async uploadFile(path: string, file: File, onProgress?: ProgressCallback): Promise<UploadResult> {
    const storageRef = ref(storage, path)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(progress, snapshot.state)
          }
        },
        (error) => {
          console.error('[Storage] Upload error:', error)
          reject(formatError(error))
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({
              path,
              url: downloadURL,
              fileName: path.split('/').pop() || '',
              contentType: file.type,
              size: file.size
            })
          } catch (error) {
            reject(error)
          }
        }
      )
    })
  },

  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('[Storage] Delete error:', error)
      throw formatError(error)
    }
  },

  async getURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error('[Storage] Get URL error:', error)
      throw formatError(error)
    }
  },

  async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path)
      return await getMetadata(storageRef)
    } catch (error) {
      console.error('[Storage] Get metadata error:', error)
      throw formatError(error)
    }
  },

  // ============================================
  // IMAGE PROCESSING
  // ============================================

  async resizeImage(
    file: File,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          ctx.drawImage(img, 0, 0, width, height)

          // Convert back to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'))
                return
              }
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(resizedFile)
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = () => reject(new Error('Could not load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Could not read file'))
      reader.readAsDataURL(file)
    })
  },

  async createThumbnail(file: File, size = 200): Promise<File> {
    return this.resizeImage(file, size, size, 0.7)
  },

  // ============================================
  // UTILITIES
  // ============================================

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Kiwi Church - Firebase Storage Service
// Handles file uploads, downloads, and management

const Storage = {
    // ============================================
    // UPLOAD HELPERS
    // ============================================

    // Generate a unique filename
    generateFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = originalName.split('.').pop().toLowerCase();
        return `${timestamp}-${random}.${ext}`;
    },

    // Validate file type
    isValidImage(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return validTypes.includes(file.type);
    },

    isValidDocument(file) {
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        return validTypes.includes(file.type);
    },

    // Validate file size (in MB)
    isValidSize(file, maxSizeMB) {
        return file.size <= maxSizeMB * 1024 * 1024;
    },

    // ============================================
    // PROFILE IMAGES
    // ============================================

    async uploadProfileImage(userId, file, onProgress = null) {
        if (!this.isValidImage(file)) {
            throw new Error('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
        }

        if (!this.isValidSize(file, 5)) {
            throw new Error('Image must be smaller than 5MB');
        }

        const fileName = this.generateFileName(file.name);
        const path = `users/${userId}/profile/${fileName}`;

        return this.uploadFile(path, file, onProgress);
    },

    async deleteProfileImage(userId, fileName) {
        const path = `users/${userId}/profile/${fileName}`;
        return this.deleteFile(path);
    },

    // ============================================
    // KETE (BLOG) IMAGES
    // ============================================

    async uploadKeteImage(postId, file, onProgress = null) {
        if (!this.isValidImage(file)) {
            throw new Error('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
        }

        if (!this.isValidSize(file, 10)) {
            throw new Error('Image must be smaller than 10MB');
        }

        const fileName = this.generateFileName(file.name);
        const path = `kete/${postId}/${fileName}`;

        return this.uploadFile(path, file, onProgress);
    },

    async deleteKeteImage(postId, fileName) {
        const path = `kete/${postId}/${fileName}`;
        return this.deleteFile(path);
    },

    // ============================================
    // EVENT IMAGES
    // ============================================

    async uploadEventImage(eventId, file, onProgress = null) {
        if (!this.isValidImage(file)) {
            throw new Error('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
        }

        if (!this.isValidSize(file, 10)) {
            throw new Error('Image must be smaller than 10MB');
        }

        const fileName = this.generateFileName(file.name);
        const path = `events/${eventId}/${fileName}`;

        return this.uploadFile(path, file, onProgress);
    },

    // ============================================
    // GATHERING IMAGES
    // ============================================

    async uploadGatheringImage(gatheringId, file, onProgress = null) {
        if (!this.isValidImage(file)) {
            throw new Error('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
        }

        if (!this.isValidSize(file, 10)) {
            throw new Error('Image must be smaller than 10MB');
        }

        const fileName = this.generateFileName(file.name);
        const path = `gatherings/${gatheringId}/${fileName}`;

        return this.uploadFile(path, file, onProgress);
    },

    // ============================================
    // MESSAGE BOARD ATTACHMENTS
    // ============================================

    async uploadBoardAttachment(boardId, postId, file, onProgress = null) {
        const isImage = this.isValidImage(file);
        const isDoc = this.isValidDocument(file);

        if (!isImage && !isDoc) {
            throw new Error('Please upload an image or document (PDF, DOC)');
        }

        if (!this.isValidSize(file, 25)) {
            throw new Error('File must be smaller than 25MB');
        }

        const fileName = this.generateFileName(file.name);
        const path = `messageBoards/${boardId}/posts/${postId}/${fileName}`;

        return this.uploadFile(path, file, onProgress);
    },

    // ============================================
    // SHARED RESOURCES
    // ============================================

    async uploadResource(file, onProgress = null) {
        const isImage = this.isValidImage(file);
        const isDoc = this.isValidDocument(file);

        if (!isImage && !isDoc) {
            throw new Error('Please upload an image or document (PDF, DOC)');
        }

        if (!this.isValidSize(file, 50)) {
            throw new Error('File must be smaller than 50MB');
        }

        const fileName = this.generateFileName(file.name);
        const path = `resources/${fileName}`;

        return this.uploadFile(path, file, onProgress);
    },

    // ============================================
    // TEMPORARY UPLOADS
    // ============================================

    async uploadTemp(userId, file, onProgress = null) {
        if (!this.isValidSize(file, 25)) {
            throw new Error('File must be smaller than 25MB');
        }

        const fileName = this.generateFileName(file.name);
        const path = `temp/${userId}/${fileName}`;

        return this.uploadFile(path, file, onProgress);
    },

    async clearTempFiles(userId) {
        const listRef = storage.ref(`temp/${userId}`);

        try {
            const result = await listRef.listAll();
            const deletePromises = result.items.map(item => item.delete());
            await Promise.all(deletePromises);
            return true;
        } catch (error) {
            console.error('[Storage] Clear temp error:', error);
            return false;
        }
    },

    // ============================================
    // CORE UPLOAD/DOWNLOAD
    // ============================================

    async uploadFile(path, file, onProgress = null) {
        const storageRef = storage.ref(path);
        const uploadTask = storageRef.put(file);

        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) {
                        onProgress(progress, snapshot.state);
                    }
                },
                (error) => {
                    // Error
                    console.error('[Storage] Upload error:', error);
                    reject(this.formatError(error));
                },
                async () => {
                    // Complete
                    try {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        resolve({
                            path,
                            url: downloadURL,
                            fileName: path.split('/').pop(),
                            contentType: file.type,
                            size: file.size
                        });
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    },

    async deleteFile(path) {
        try {
            const storageRef = storage.ref(path);
            await storageRef.delete();
            return true;
        } catch (error) {
            console.error('[Storage] Delete error:', error);
            throw this.formatError(error);
        }
    },

    async getDownloadURL(path) {
        try {
            const storageRef = storage.ref(path);
            return await storageRef.getDownloadURL();
        } catch (error) {
            console.error('[Storage] Get URL error:', error);
            throw this.formatError(error);
        }
    },

    async getMetadata(path) {
        try {
            const storageRef = storage.ref(path);
            return await storageRef.getMetadata();
        } catch (error) {
            console.error('[Storage] Get metadata error:', error);
            throw this.formatError(error);
        }
    },

    // ============================================
    // IMAGE PROCESSING
    // ============================================

    // Resize image before upload (client-side)
    async resizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }

                    // Create canvas and resize
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Create new file from blob
                            const resizedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(resizedFile);
                        } else {
                            reject(new Error('Failed to resize image'));
                        }
                    }, 'image/jpeg', quality);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    },

    // Create thumbnail
    async createThumbnail(file, size = 200) {
        return this.resizeImage(file, size, size, 0.7);
    },

    // ============================================
    // HELPERS
    // ============================================

    formatError(error) {
        const errorMessages = {
            'storage/unauthorized': 'You do not have permission to perform this action',
            'storage/canceled': 'Upload was cancelled',
            'storage/unknown': 'An unknown error occurred',
            'storage/object-not-found': 'File not found',
            'storage/quota-exceeded': 'Storage quota exceeded',
            'storage/unauthenticated': 'Please sign in to upload files',
            'storage/retry-limit-exceeded': 'Upload failed. Please try again'
        };

        return new Error(errorMessages[error.code] || error.message);
    },

    // Format file size for display
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Make available globally
window.Storage = Storage;

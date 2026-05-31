import { useState } from 'react';

export const useImageUpload = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploadError(null);
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setUploadError(null);
  };

  const uploadImage = async (endpoint, token) => {
    if (!imageFile) return null;

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('image', imageFile);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      // Return promise
      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              setIsUploading(false);
              setImageFile(null);
              setImagePreview(null);
              setUploadProgress(0);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => {
          setIsUploading(false);
          reject(new Error('Upload error'));
        };

        xhr.open('POST', endpoint);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
      });
    } catch (error) {
      setUploadError(error.message || 'Failed to upload image');
      setIsUploading(false);
      throw error;
    }
  };

  return {
    imageFile,
    imagePreview,
    uploadProgress,
    uploadError,
    isUploading,
    handleImageSelect,
    resetImage,
    uploadImage,
    setImageFile,
    setImagePreview,
  };
};

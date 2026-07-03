import React from 'react';
import { FaCamera, FaTimes, FaCheckCircle, FaExclamationCircle, FaCloudUploadAlt } from 'react-icons/fa';
import { useImageUpload } from '../hooks/useImageUpload';

const ImageUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Upload Profile Picture',
  currentImage = null,
  uploadEndpoint = null,
  authToken = null,
}) => {
  const {
    imagePreview,
    uploadProgress,
    uploadError,
    isUploading,
    handleImageSelect,
    resetImage,
    uploadImage,
  } = useImageUpload();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
            <FaCamera style={{ color: '#d97706' }} />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Image Preview or Upload Area */}
        <div className="mb-6">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-xl"
              />
              <button
                onClick={resetImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                disabled={isUploading}
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-orange-300 rounded-xl p-8 cursor-pointer hover:bg-orange-50 transition-colors">
              <FaCloudUploadAlt size={40} style={{ color: '#d97706' }} className="mb-3" />
              <p className="text-neutral-800 font-semibold mb-1">Click to upload</p>
              <p className="text-xs text-neutral-600 text-center">PNG, JPG, GIF up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <FaExclamationCircle />
            {uploadError}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-neutral-700">Uploading...</p>
              <p className="text-sm font-bold text-orange-600">{uploadProgress}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-semibold text-neutral-700 border-2 border-neutral-200 hover:bg-neutral-50 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!imagePreview || !onSuccess) return;

              if (uploadEndpoint) {
                try {
                  const response = await uploadImage(uploadEndpoint, authToken);
                  const imageUrl = response?.imageUrl || response?.url || response?.path || null;
                  if (imageUrl) {
                    onSuccess(imageUrl, response);
                  }
                } catch (error) {
                  // uploadError is handled by hook
                }
              } else {
                onSuccess(imagePreview);
              }
            }}
            disabled={!imagePreview || isUploading}
            className="flex-1 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg flex items-center justify-center gap-2"
            style={{
              background: imagePreview && !isUploading ? '#d97706' : '#ccc',
              cursor: imagePreview && !isUploading ? 'pointer' : 'not-allowed',
            }}
          >
            <FaCheckCircle /> {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-neutral-600 text-center mt-4">
          Your profile picture will be visible to all users
        </p>
      </div>
    </div>
  );
};

export default ImageUploadModal;

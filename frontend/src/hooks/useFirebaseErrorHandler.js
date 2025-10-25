import { useState, useEffect } from 'react';

export const useFirebaseErrorHandler = (action) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAction = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const result = await action(...args);
      setSuccess(true);
      return result;
    } catch (err) {
      console.error('Firebase operation failed:', err);
      let message = 'An unexpected error occurred';
      
      if (err.code) {
        switch (err.code) {
          case 'permission-denied':
            message = 'You do not have permission to perform this action. Please check that you are signed in with the correct admin account.';
            break;
          case 'storage/unauthorized':
            message = 'Unable to upload image. Please verify your admin permissions.';
            break;
          case 'storage/retry-limit-exceeded':
            message = 'Network error while uploading. Please check your connection and try again.';
            break;
          case 'storage/invalid-checksum':
            message = 'File upload failed. Please try again with a smaller image.';
            break;
          case 'storage/canceled':
            message = 'Upload was cancelled. Please try again.';
            break;
          case 'auth/invalid-email':
          case 'auth/user-not-found':
            message = 'Please sign in with a valid admin account.';
            break;
          default:
            message = err.message || 'Operation failed. Please try again.';
        }
      }
      
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    success,
    handleAction,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false)
  };
};
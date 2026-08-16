import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const AvatarUpload = ({ avatar, firstName, lastName, size = 'xl', onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(avatar || '');
  const fileInputRef = useRef(null);

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await axios.put('/api/user/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newAvatar = data.avatar;
      setPreview(newAvatar);
      toast.success('Profile picture updated!');

      if (onUploadSuccess) {
        onUploadSuccess(newAvatar);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`relative ${sizeClasses[size]} shrink-0`}>
      <div
        className={`w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden ${uploading ? 'opacity-70' : ''}`}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className={textSizeClasses[size]}>
            {initials}
          </span>
        )}
      </div>

      <button
        onClick={handleClick}
        disabled={uploading}
        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
        aria-label="Upload avatar"
      >
        {uploading ? (
          <span className="text-white text-xs font-medium">Uploading...</span>
        ) : (
          <Camera size={size === 'xl' ? 20 : 16} className="text-white" />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;

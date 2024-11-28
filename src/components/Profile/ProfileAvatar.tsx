import React from 'react';
import { Camera } from 'lucide-react';

interface ProfileAvatarProps {
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export const ProfileAvatar = ({
  avatarUrl,
  firstName,
  lastName,
  onAvatarUpload,
  loading
}: ProfileAvatarProps) => {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="relative w-32 h-32">
      <div className={`w-full h-full rounded-2xl overflow-hidden border-4 border-white shadow-xl ${loading ? 'opacity-50' : ''}`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{initials}</span>
          </div>
        )}
      </div>
      <label
        className="absolute -bottom-2 -right-2 p-3 bg-blue-500 rounded-xl shadow-lg cursor-pointer 
                   hover:bg-blue-600 transition-colors group"
        htmlFor="avatar-upload"
      >
        <Camera className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={onAvatarUpload}
          className="hidden"
          disabled={loading}
        />
      </label>
    </div>
  );
};
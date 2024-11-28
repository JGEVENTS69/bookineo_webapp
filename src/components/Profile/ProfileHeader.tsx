import React from 'react';
import { ProfileAvatar } from '../Profile/ProfileAvatar';
import { SubscriptionBadge } from '../Profile/SubscriptionBadge';
import { User } from '../../types/user';

interface ProfileHeaderProps {
  user: User;
  loading: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({ user, loading, onAvatarUpload }: ProfileHeaderProps) => {
  return (
    <div className="relative">
      <div 
        className="h-40 bg-transparent
                   bg-cover bg-center relative overflow-hidden"
      >
        <div className="absolute inset-0" />
      </div>
      <div className="absolute bottom-20 left-0 right-0 transform translate-y-1/2 px-4">
        <div className="flex items-end gap-6 ">
          <ProfileAvatar
            avatarUrl={user.avatar_url}
            firstName={user.first_name}
            lastName={user.last_name}
            onAvatarUpload={onAvatarUpload}
            loading={loading}
          />
          <div className="mb-4 text-black">
          <div className='flex absolut right-0'>
          <SubscriptionBadge subscription={user.subscription} />
          </div>
            <div className="flex items-center mt-5 mb-1">
              <h1 className="text-3xl font-bold drop-shadow-lg">
                {user.first_name} {user.last_name}
              </h1>
            </div>
            <p className="text-white/80">@{user.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
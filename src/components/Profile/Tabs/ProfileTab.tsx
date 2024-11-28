import React from 'react';
import { User } from '../../../types/user';
import { ProfileHeader } from '../ProfileHeader';
import { ProfileForm } from '../ProfileForm';
import { ProfileStats } from '../ProfileStats';

interface ProfileTabProps {
  user: User | null;
  loading: boolean;
  isEditing: boolean;
  formData: {
    first_name: string;
    last_name: string;
    username: string;
  };
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormSubmit: (e: React.FormEvent) => void;
  onEditToggle: () => void;
}

export const ProfileTab = ({
  user,
  loading,
  isEditing,
  formData,
  onAvatarUpload,
  onFormChange,
  onFormSubmit,
  onEditToggle,
}: ProfileTabProps) => {
  const isFreemium = user?.subscription === 'Freemium';
  const boxLimit = isFreemium ? 5 : Infinity;
  const favoriteLimit = isFreemium ? 5 : Infinity;

  return (
    <div className="space-y-6">
      <ProfileHeader
        user={user}
        loading={loading}
        onAvatarUpload={onAvatarUpload}
        onEditToggle={onEditToggle}
        isEditing={isEditing}
      />

      {isEditing ? (
        <ProfileForm
          formData={formData}
          onChange={onFormChange}
          onSubmit={onFormSubmit}
          loading={loading}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Prénom</p>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {user?.first_name || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nom</p>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {user?.last_name || 'Non renseigné'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Nom d'utilisateur</p>
              <p className="mt-1 text-lg font-medium text-gray-900">@{user?.username}</p>
            </div>

            <ProfileStats
              boxCount={0}
              favoriteCount={0}
              boxLimit={boxLimit}
              favoriteLimit={favoriteLimit}
            />
          </div>
        </div>
      )}
    </div>
  );
};
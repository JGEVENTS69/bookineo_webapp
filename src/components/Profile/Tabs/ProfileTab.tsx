import React from 'react';
import { User } from '../../../types/user';
import { Edit, X, Camera } from 'lucide-react';
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          {/* Photo de profil */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className={`w-full h-full object-cover ${loading ? 'opacity-50' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
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
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier les informations' : 'Informations personnelles'}
            </h3>
            <button
              onClick={onEditToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isEditing ? "Annuler" : "Modifier"}
            >
              {isEditing ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
            </button>
          </div>

          {isEditing ? (
            <ProfileForm
              formData={formData}
              onChange={onFormChange}
              onSubmit={onFormSubmit}
              loading={loading}
            />
          ) : (
            <div className="space-y-6">
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
            </div>
          )}
        </div>
      </div>

      <ProfileStats
        boxCount={0}
        favoriteCount={0}
        boxLimit={boxLimit}
        favoriteLimit={favoriteLimit}
      />
    </div>
  );
};
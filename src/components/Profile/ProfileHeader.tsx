import { User, Upload } from 'lucide-react';

interface ProfileHeaderProps {
  user: any;
  loading: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({ user, loading, onAvatarUpload }: ProfileHeaderProps) => {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient background with pattern */}
      <div className="absolute inset-0 h-64 bg-gradient-to-br from-[#266CDD] to-[#266CDD]/80">
        <div className="absolute inset-0 pattern-grid-white/10" />
      </div>
      
      <div className="relative pt-8 px-4 pb-20">
        <div className="flex flex-col items-center">
          {/* Avatar with glowing effect */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-white/50 rounded-full blur-md"></div>
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-white"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-white ring-4 ring-white flex items-center justify-center">
                  <User className="h-14 w-14 text-gray-400" />
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 bg-white shadow-lg text-[#266CDD] p-2 rounded-full cursor-pointer transform transition-all hover:scale-110 hover:rotate-12">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onAvatarUpload}
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          {/* User Info */}
          <div className="text-center mt-6 space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {user.username}
            </h1>
            <p className="text-white/90 text-sm font-medium">
              {user.email}
            </p>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-white text-sm font-medium">
                {user.subscription}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
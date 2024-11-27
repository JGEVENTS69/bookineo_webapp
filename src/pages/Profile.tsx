import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Edit, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProfileHeader } from '../components/Profile/ProfileHeader';
import { ProfileStats } from '../components/Profile/ProfileStats';
import { ProfileForm } from '../components/Profile/ProfileForm';

const ProfilePage = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boxStats, setBoxStats] = useState({
    boxCount: 0,
    favoriteCount: 0,
  });
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
  });

  const isFreemium = user?.subscription === 'Freemium';
  const boxLimit = isFreemium ? 5 : Infinity;
  const favoriteLimit = isFreemium ? 5 : Infinity;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserStats = async () => {
      const [boxesResult, favoritesResult] = await Promise.all([
        supabase
          .from('book_boxes')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id),
        supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      setBoxStats({
        boxCount: boxesResult.count || 0,
        favoriteCount: favoritesResult.count || 0,
      });
    };

    fetchUserStats();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profil mis à jour');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user?.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success('Photo de profil mise à jour');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Supprimer votre compte ? Cette action est irréversible.')) {
      try {
        setLoading(true);
        await supabase.from('users').delete().eq('id', user?.id);
        await signOut();
        navigate('/');
        toast.success('Compte supprimé');
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-lg mt-5 mx-auto">
        {/* Header with edit button */}
        <div className="relative">
          <ProfileHeader
            user={user}
            loading={loading}
            onAvatarUpload={handleAvatarUpload}
          />
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2.5 rounded-full text-white hover:bg-white/20 active:scale-95 transition-all"
            aria-label={isEditing ? "Annuler" : "Modifier"}
          >
            {isEditing ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
          </button>
        </div>

        {/* Main content */}
        <div className="bg-white shadow-sm rounded-t-3xl -mt-8">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Modifier le profil' : 'Informations'}
            </h2>
          </div>

          {isEditing ? (
            <ProfileForm
              formData={formData}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              onSubmit={handleUpdateProfile}
              loading={loading}
            />
          ) : (
            <>
              <div className="p-4 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prénom</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {user.first_name || 'Non renseigné'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {user.last_name || 'Non renseigné'}
                    </p>
                  </div>
                </div>
              </div>

              <ProfileStats
                boxCount={boxStats.boxCount}
                favoriteCount={boxStats.favoriteCount}
                boxLimit={boxLimit}
                favoriteLimit={favoriteLimit}
              />
            </>
          )}

          {/* Delete account button */}
          <div className="p-4">
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-rose-50 text-rose-600 py-3 px-4 rounded-xl font-medium hover:bg-rose-100 active:bg-rose-200 transition-colors flex items-center justify-center gap-2 group"
            >
              <Trash2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
              <span>Supprimer le compte</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
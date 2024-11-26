import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import {
  User,
  Edit,
  Save,
  X,
  Upload,
  Trash2,
  AtSign,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  const handleUpdateProfile = async (e) => {
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
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
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

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success('Photo de profil mise à jour');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm('Supprimer votre compte ? Cette action est irréversible.')
    ) {
      try {
        setLoading(true);
        await supabase.from('users').delete().eq('id', user?.id);
        await signOut();
        navigate('/');
        toast.success('Compte supprimé');
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white border-2 border-primary shadow-xl rounded-xl overflow-hidden">
        <div className="bg-primary p-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover border-3 border-white"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center">
                  <User className="h-10 w-10 text-neutral-500" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-[#d8596e] text-white p-1.5 rounded-full cursor-pointer">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={loading}
                />
              </label>
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-white">
                {user.username}
              </h1>
              <div className="flex items-center mt-1 space-x-2 text-base text-white">
                <Mail className="h-4 w-4" />
                <p>{user.email}</p>
              </div>
              <div className="mt-3 text-sm bg-[#d8596e] px-3 py-1 rounded-full inline-block">
                <span className="text-white">Membre : </span>
                <span className="font-bold text-white">
                  {user.subscription}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-white hover:bg-neutral-200 hover:text-primary p-2 rounded-full"
            >
              {isEditing ? <X /> : <Edit />}
            </button>
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-neutral-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring focus:ring-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-neutral-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring focus:ring-neutral-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-lg font-medium text-neutral-700">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring focus:ring-neutral-200"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-neutral-700 transition"
                  disabled={loading}
                >
                  <Save className="mr-2 h-5 w-5" />
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-bold text-primary">Prénom</p>
                  <p className="font-medium text-neutral-800">
                    {user.first_name || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">Nom</p>
                  <p className="font-medium text-neutral-800">
                    {user.last_name || 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-neutral-100 rounded-lg p-4">
            <h2 className="text-xl font-bold text-neutral-800 mb-4">
              Vos Statistiques
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Bloc Boîtes Créées */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-neutral-500">Boîtes Créées</p>
                <p className="text-xl font-bold text-neutral-800">
                  {boxStats.boxCount} / {boxLimit}
                </p>
                {/* Barre de progression pour Boîtes Créées */}
                <div className="w-full bg-neutral-200 rounded-full h-4 mt-2">
                  <div
                    className="bg-primary h-4 rounded-full"
                    style={{
                      width: `${Math.min(
                        (boxStats.boxCount / boxLimit) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Bloc Favoris */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-neutral-500">Favoris</p>
                <p className="text-xl font-bold text-neutral-800">
                  {boxStats.favoriteCount} / {favoriteLimit}
                </p>
                {/* Barre de progression pour Favoris */}
                <div className="w-full bg-neutral-200 rounded-full h-4 mt-2">
                  <div
                    className="bg-primary h-4 rounded-full"
                    style={{
                      width: `${Math.min(
                        (boxStats.favoriteCount / favoriteLimit) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="mt-5 text-sm font-bold bg-[#d8596e] px-4 py-4 rounded-lg inline-block text-white"
          >
            <Trash2 className="inline-block mr-2 h-6 w-6" />
            Supprimer le compte
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

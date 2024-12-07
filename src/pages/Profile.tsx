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
  Mail,
  CheckCircle,
  ChevronDown,
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
    visitCount: 0,
  });
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    address: user?.address || '',
    country: user?.country || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);

  const isFreemium = user?.subscription === 'Freemium';
  const boxLimit = isFreemium ? 5 : Infinity;
  const favoriteLimit = isFreemium ? 5 : Infinity;
  const visitLimit = isFreemium ? 5 : Infinity;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserStats = async () => {
      const [boxesResult, favoritesResult, visitsResult] = await Promise.all([
        supabase
          .from('book_boxes')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id),
        supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('box_visits')
          .select('*', { count: 'exact', head: true })
          .eq('visitor_id', user.id),
      ]);

      setBoxStats({
        boxCount: boxesResult.count || 0,
        favoriteCount: favoritesResult.count || 0,
        visitCount: visitsResult.count || 0,
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

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const newAvatarUrl = data?.publicUrl;
      if (!newAvatarUrl) throw new Error('URL du nouvel avatar introuvable');

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
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
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-500 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-3xl overflow-hidden transform transition-transform duration-300 hover:scale-105">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-3xl">
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="hover:bg-white/20 p-2 rounded-full flex justify-center items-center transition"
            >
              {isEditing ? <X className="h-6 w-6" /> : <Edit className="h-6 w-6" />}
            </button>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-28 w-28 rounded-full object-cover border-4 border-white/30 shadow-lg"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-14 w-14 text-white/70" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-white/30 backdrop-blur-sm text-white p-2 rounded-full cursor-pointer hover:bg-white/40 transition">
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={loading}
                />
              </label>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
              <div className="flex items-center justify-center space-x-2 opacity-80">
                <Mail className="h-5 w-5" />
                <p className="text-sm">{user.email}</p>
              </div>
              <div className="mt-3">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {user.subscription}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
                  className="w-full bg-neutral-100 rounded-xl p-4 flex justify-between items-center"
                >
                  <h2 className="text-xl font-bold text-neutral-800">
                    Informations supplémentaires
                  </h2>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      isAdditionalInfoOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isAdditionalInfoOpen && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">
                        Code Postal
                      </label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) =>
                          setFormData({ ...formData, postal_code: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">
                        Pays
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                  disabled={loading}
                >
                  {loading ? (
                    'Enregistrement...'
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-primary mb-2">Nom</p>
                  <p className="text-lg font-semibold text-neutral-800">
                    {user.last_name || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary mb-2">Prénom</p>
                  <p className="text-lg font-semibold text-neutral-800">
                    {user.first_name || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary mb-2">Email</p>
                  <p className="text-lg font-semibold text-neutral-800">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary mb-2">Nom d'utilisateur</p>
                  <p className="text-lg font-semibold text-neutral-800">
                    {user.username}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
                  className="w-full flex justify-between items-center"
                >
                  <h2 className="pl-2 text-lg font-bold text-neutral-800">
                    Informations supplémentaires :
                  </h2>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      isAdditionalInfoOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isAdditionalInfoOpen && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">Adresse</p>
                      <p className="text-base font-semibold text-neutral-800">
                        {user.address || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">Ville</p>
                      <p className="text-base font-semibold text-neutral-800">
                        {user.city || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary mb-1 mt-4">Code Postal</p>
                      <p className="text-base font-semibold text-neutral-800">
                        {user.postal_code || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary mb-1 mt-4">Pays</p>
                      <p className="text-base font-semibold text-neutral-800">
                        {user.country || 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Stats Section */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-neutral-100 rounded-xl p-4 flex justify-between items-center"
            >
              <h2 className="text-xl font-bold text-neutral-800">
                Plan Freemium
              </h2>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="mt-4 bg-neutral-100 rounded-xl p-4 space-y-6">
                <div className="space-y-4">
                  {/* Boîtes Créées */}
                  <div className="bg-white rounded-lg p-5 shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-neutral-500">Boîtes ajoutées</p>
                      <CheckCircle className="h-5 w-5 text-indigo-500" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-800 mb-2">
                      {boxStats.boxCount} / {boxLimit}
                    </p>
                    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-2"
                        style={{
                          width: `${Math.min(
                            (boxStats.boxCount / boxLimit) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Favoris */}
                  <div className="bg-white rounded-lg p-5 shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-neutral-500">Boîte favoris</p>
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-800 mb-2">
                      {boxStats.favoriteCount} / {favoriteLimit}
                    </p>
                    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-2"
                        style={{
                          width: `${Math.min(
                            (boxStats.favoriteCount / favoriteLimit) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-5 shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-neutral-500">Visites effectuées</p>
                      <CheckCircle className="h-5 w-5 text-indigo-500" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-800 mb-2">
                      {boxStats.visitCount} / {visitLimit}
                    </p>
                    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-2"
                        style={{
                          width: `${Math.min((boxStats.visitCount / visitLimit) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                {isFreemium && (
                  <p className="text-sm text-neutral-500">
                    Passez en version premium pour bénéficier de plus de fonctionnalités.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Delete Account */}
          <div className="text-center">
            <button
              onClick={handleDeleteAccount}
              className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition"
            >
              <Trash2 className="inline-block mr-2 h-5 w-5" />
              Supprimer le compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

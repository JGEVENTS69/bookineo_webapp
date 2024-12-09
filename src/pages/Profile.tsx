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
  const [bannerUrl, setBannerUrl] = useState(user?.banner_url || '');
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
      toast.success('Profile updated successfully');
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
      if (!newAvatarUrl) throw new Error('New avatar URL not found');

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `banner/${user?.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('banner')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('banner').getPublicUrl(filePath);

      const newBannerUrl = data?.publicUrl;
      if (!newBannerUrl) throw new Error('New banner URL not found');

      const { error: updateError } = await supabase
        .from('users')
        .update({ banner_url: newBannerUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setBannerUrl(newBannerUrl);
      toast.success('Banner image updated');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Delete your account? This action cannot be undone.')) {
      try {
        setLoading(true);
        await supabase.from('users').delete().eq('id', user?.id);
        await signOut();
        navigate('/');
        toast.success('Account deleted');
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative">
          <div className="w-full h-48 bg-slate-400 flex items-center justify-center">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt="Banner"
                className="w-full h-48 object-cover"
              />
            ) : (
              <img 
              src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Logo-Blanc.png"
              className="w-80 h-35 opacity-40"
              />
            )}
            <label className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="w-5 h-5 text-slate-600" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={loading}
              />
            </label>
            <div className="absolute -bottom-10 left-8 flex items-end space-x-4">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-primary flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <img
             src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Icon-Logo-Blanc.png"
             alt="Default Avatar"
              className="w-14 h-14 mr-2 mt-1"
             />
           )}
                <label className="absolute bottom-0 ml-20 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload className="w-5 h-5 text-slate-600" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={loading}
                  />
                </label>
              </div>
              <div className="mb-12">
                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                <div className="flex items-center mt-1 text-white space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                {isEditing ? (
                  <X className="w-6 h-6 text-black" />
                ) : (
                  <Edit className="w-6 h-6 text-black" />
                  
                )}
              </button>
            </div>
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">
                      Pseudo Bookineo
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
                    className="flex items-center justify-between w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Autres informations</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isAdditionalInfoOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isAdditionalInfoOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">
                          Adresse
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">
                          Ville
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">
                          Code Postal
                        </label>
                        <input
                          type="text"
                          value={formData.postal_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              postal_code: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">
                          Pays
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({ ...formData, country: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-primary">
                      Nom
                    </h3>
                    <p className="mt-1 text-slate-900">
                      {user.first_name || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary">
                      Prénom
                    </h3>
                    <p className="mt-1 text-slate-900">
                      {user.last_name || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary">
                      Pseudo Bookineo
                    </h3>
                    <p className="mt-1 text-slate-900">{user.username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary">Email</h3>
                    <p className="mt-1 text-slate-900">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
                    className="flex items-center justify-between w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Autres informations</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isAdditionalInfoOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isAdditionalInfoOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h3 className="text-sm font-bold text-primary">
                          Adresse
                        </h3>
                        <p className="mt-1 text-slate-900">
                          {user.address || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-primary">
                          Ville
                        </h3>
                        <p className="mt-1 text-slate-900">
                          {user.city || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-primary">
                          Code Postal
                        </h3>
                        <p className="mt-1 text-slate-900">
                          {user.postal_code || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-primary">
                          Pays
                        </h3>
                        <p className="mt-1 text-slate-900">
                          {user.country || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats Section */}
            <div className="mt-8">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center bg-[#d8596e]/80 justify-between w-full px-4 py-2 text-left text-slate-700 hover:bg-[#d8596e] rounded-lg transition-colors"
              >
                <span className="font-medium text-white">
                  {isFreemium ? 'Plan Freemium' : 'Premium Plan'}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 text-white ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-slate-600">
                        Boîtes à livres ajoutées
                      </h3>
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {boxStats.boxCount}
                      <span className="text-sm font-normal text-slate-500 ml-1">
                        / {boxLimit === Infinity ? '∞' : boxLimit}
                      </span>
                    </p>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (boxStats.boxCount / boxLimit) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-slate-600">
                        Boîte à livres favoris
                      </h3>
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {boxStats.favoriteCount}
                      <span className="text-sm font-normal text-slate-500 ml-1">
                        / {favoriteLimit === Infinity ? '∞' : favoriteLimit}
                      </span>
                    </p>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (boxStats.favoriteCount / favoriteLimit) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-slate-600">
                        Boîtes à livres visitées
                      </h3>
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {boxStats.visitCount}
                      <span className="text-sm font-normal text-slate-500 ml-1">
                        / {visitLimit === Infinity ? '∞' : visitLimit}
                      </span>
                    </p>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (boxStats.visitCount / visitLimit) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Account */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <button
                onClick={handleDeleteAccount}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer mon compte</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

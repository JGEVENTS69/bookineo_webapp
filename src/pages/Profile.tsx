import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { User, Settings, Package, LogOut, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProfileTab } from '../components/Profile/Tabs/ProfileTab';
import { BoxesTab } from '../components/Profile/Tabs/BoxesTab';
import { SettingsTab } from '../components/Profile/Tabs/SettingsTab';

const TABS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'boxes', label: 'Mes boîtes', icon: BookOpen },
  { id: 'settings', label: 'Paramètres', icon: Settings }
] as const;

type TabId = typeof TABS[number]['id'];

const ProfilePage = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id);

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
      const filePath = `avatars/${user.id}.${fileExt}`;

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
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Photo de profil mise à jour');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        setLoading(true);
        await supabase.from('users').delete().eq('id', user.id);
        await signOut();
        navigate('/');
        toast.success('Compte supprimé avec succès');
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpgrade = () => {
    toast.success('Redirection vers la page de paiement...');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 px-3 py-6 fixed h-full">
        <div className="mb-8 px-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all ${
                activeTab === id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-3 right-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium 
                     text-gray-600 hover:bg-gray-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{TABS.find(t => t.id === activeTab)?.label}</h1>
          </div>

          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              loading={loading}
              isEditing={isEditing}
              formData={formData}
              onAvatarUpload={handleAvatarUpload}
              onFormChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              onFormSubmit={handleUpdateProfile}
              onEditToggle={() => setIsEditing(!isEditing)}
            />
          )}
          {activeTab === 'boxes' && <BoxesTab />}
          {activeTab === 'settings' && (
            <SettingsTab
              subscription={user.subscription || 'Freemium'}
              onDeleteAccount={handleDeleteAccount}
              onUpgrade={handleUpgrade}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
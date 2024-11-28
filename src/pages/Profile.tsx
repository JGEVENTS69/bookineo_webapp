import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProfileTab } from '../components/Profile/Tabs/ProfileTab';
import { BoxesTab } from '../components/Profile/Tabs/BoxesTab';
import { SettingsTab } from '../components/Profile/Tabs/SettingsTab';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'boxes', label: 'Mes boîtes' },
  { id: 'settings', label: 'Paramètres' }
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        setLoading(true);
        await supabase.from('users').delete().eq('id', user?.id);
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
    // Logique pour la mise à niveau vers Premium
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                activeTab === id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-8">
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
              subscription={user?.subscription || 'Freemium'}
              onDeleteAccount={handleDeleteAccount}
              onUpgrade={handleUpgrade}
            />
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-medium 
                   hover:bg-gray-200 active:bg-gray-300 transition-all flex items-center 
                   justify-center gap-2"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
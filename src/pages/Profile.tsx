import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Menu, LogOut, User, BookOpen, Settings } from 'lucide-react';
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
  const [isSidebarOpen, setSidebarOpen] = useState(false); // State for sidebar visibility

  if (!user) {
    navigate('/auth');
    return null;
  }

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
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6 text-gray-600" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 px-3 py-6 transform transition-transform duration-300 z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:block`}
      >
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
              onClick={() => {
                setActiveTab(id);
                setSidebarOpen(false); // Close sidebar on mobile
              }}
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
      <div className="flex-1 ml-0 md:ml-64">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{TABS.find(t => t.id === activeTab)?.label}</h1>
          </div>

          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'boxes' && <BoxesTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Shield, Bell, Palette, LifeBuoy, ChevronRight,
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [language, setLanguage] = useState('Français');
  const [theme, setTheme] = useState('Clair');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
    <div className="mb-4 relative">
      <label className="block text-gray-600 text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary-light pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  const SettingsSection: React.FC<{
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
  }> = ({ icon: Icon, title, children }) => (
    <section className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center mb-4">
        <Icon className="w-6 h-6 text-primary mr-3" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 p-4">
        {/* Sidebar Navigation */}
        <nav className="hidden md:block md:col-span-1 bg-white shadow rounded-lg p-4">
          <ul className="space-y-4 text-sm font-medium text-gray-600">
            <li><a href="#security" className="hover:text-primary">Sécurité</a></li>
            <li><a href="#notifications" className="hover:text-primary">Notifications</a></li>
            <li><a href="#preferences" className="hover:text-primary">Préférences</a></li>
            <li><a href="#support" className="hover:text-primary">Support et Aide</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="md:col-span-3">
          <SettingsSection icon={Shield} title="Sécurité" id="security">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {renderPasswordInput(
                'Votre mot de passe actuel',
                currentPassword,
                (e) => setCurrentPassword(e.target.value)
              )}
              {renderPasswordInput(
                'Nouveau mot de passe',
                newPassword,
                (e) => setNewPassword(e.target.value)
              )}
              {renderPasswordInput(
                'Confirmer le nouveau mot de passe',
                confirmPassword,
                (e) => setConfirmPassword(e.target.value)
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          </SettingsSection>

          <SettingsSection icon={Bell} title="Notifications" id="notifications">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-gray-600">Notifications par Email</label>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                  className="form-checkbox h-5 w-5 text-primary"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="text-gray-600">Notifications Push</label>
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={() => setPushNotifications(!pushNotifications)}
                  className="form-checkbox h-5 w-5 text-primary"
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection icon={Palette} title="Préférences de l'Application" id="preferences">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-2">Langue</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary-light"
                >
                  <option>Français</option>
                  <option>Anglais</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Thème</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary-light"
                >
                  <option>Clair</option>
                  <option>Sombre</option>
                </select>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection icon={LifeBuoy} title="Support et Aide" id="support">
            <div className="space-y-4">
              <Link to="/help" className="flex justify-between items-center hover:bg-gray-100 p-3 rounded-lg">
                <span className="text-gray-600">Centre d'Aide</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              <Link to="/contact" className="flex justify-between items-center hover:bg-gray-100 p-3 rounded-lg">
                <span className="text-gray-600">Contact Support</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
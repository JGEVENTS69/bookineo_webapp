import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Shield, Bell, Palette, LifeBuoy, ChevronRight, ChevronDown, ChevronUp,
  LockKeyhole,
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

  // State for dropdown sections
  const [openSection, setOpenSection] = useState<string | null>('security');

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
    subtitle: string;
    children: React.ReactNode;
    sectionKey: string;
  }> = ({ icon: Icon, title, subtitle, children, sectionKey }) => {
    const isOpen = openSection === sectionKey;

    return (
      <section className="bg-white rounded-lg shadow mb-4">
        <div
          onClick={() => setOpenSection(isOpen ? null : sectionKey)}
          className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex-grow">
            <div className="flex items-center mb-1">
              <Icon className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <p className="text-sm text-gray-500 pl-9">{subtitle}</p>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
        {isOpen && (
          <div className="p-6 pt-0">
            {children}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4">
        {/* Section Mot de Passe */}
        <SettingsSection
          icon={LockKeyhole}
          title="Sécurité"
          subtitle="Modifiez le mot de passe de votre compte."
          sectionKey="security"
        >
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

        <SettingsSection
          icon={LifeBuoy}
          title="Signalement et Contact"
          subtitle="Contactez-nous ou signalez une boîte."
          sectionKey="support"
        >
          <div className="space-y-4">
            <Link to="/map-signal" className="flex justify-between items-center hover:bg-gray-100 p-3 rounded-lg">
              <span className="text-gray-600">Signaler une boîte à livre</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link to="/contact" className="flex justify-between items-center hover:bg-gray-100 p-3 rounded-lg">
              <span className="text-gray-600">Contactez-nous</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

export default SettingsPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Shield, Bell, Palette, LifeBuoy, ChevronRight, ChevronDown, ChevronUp,
  LockKeyhole,
  Crown,
  X
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false); // État pour le modal

  // State for dropdown sections
  const [openSection, setOpenSection] = useState<string | null>('security');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Nouvelle méthode pour récupérer l'utilisateur
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          // Récupérer l'abonnement depuis la table 'users'
          const { data, error: userError } = await supabase
            .from('users')
            .select('subscription')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;

          setUser({ ...user, subscription: data.subscription });
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
        toast.error('Une erreur est survenue lors de la récupération des données utilisateur.');
      }
    };

    fetchUserData();
  }, []);

  // Vérification dynamique
  const isFreemium = user?.subscription === 'Freemium';

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
            {isFreemium ? (
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-100 text-gray-400">
                <div>
                  <span>Signaler une boîte à livre</span>
                  <span className="block text-sm">(Réservé aux membres Premium)</span>
                </div>
                <Crown className="w-6 h-6 text-[#ffb60e]" />
              </div>
            ) : (
              <Link to="/map-signal" className="flex justify-between items-center hover:bg-gray-100 p-3 rounded-lg">
                <span className="text-gray-600">Signaler une boîte à livre</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            )}
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="flex justify-between items-center hover:bg-gray-100 p-3 rounded-lg w-full text-left"
            >
              <span className="text-gray-600">Contactez-nous</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </SettingsSection>
      </div>
      {isContactModalOpen && <ContactModal onClose={() => setIsContactModalOpen(false)} />}
    </div>
  );
};

export default SettingsPage;

// Composant de modal de contact
const ContactModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envoyer le formulaire de contact
      const { error } = await supabase
        .from('contact_messages')
        .insert([{ name, email, message }]);

      if (error) throw error;

      toast.success('Votre message a été envoyé avec succès');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center pr-5 pl-5 pt-10 justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">Contactez-nous</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Nom :</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary-light"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Email :</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary-light"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary-light"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

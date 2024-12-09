import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdatePassword = async (e) => {
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
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Paramètres</h1>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Sécurité</h2>
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-4 relative">
              <label className="block text-gray-700 mb-2">Mot de Passe Actuel</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 mb-2">Nouveau Mot de Passe</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 mb-2">Confirmer le Nouveau Mot de Passe</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Notifications par Email</label>
            <input type="checkbox" className="ml-2" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Notifications Push</label>
            <input type="checkbox" className="ml-2" />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Préférences de l'Application</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Langue</label>
            <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Français</option>
              <option>Anglais</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Thème</label>
            <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Clair</option>
              <option>Sombre</option>
            </select>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Support et Aide</h2>
          <div className="mb-4">
            <Link to="/help" className="text-blue-500 hover:underline">Centre d'Aide</Link>
          </div>
          <div className="mb-4">
            <Link to="/contact" className="text-blue-500 hover:underline">Contact Support</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;

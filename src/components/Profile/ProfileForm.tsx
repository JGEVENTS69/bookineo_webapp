import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProfileFormProps {
  formData: {
    first_name: string;
    last_name: string;
    username: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const ProfileForm = ({
  formData,
  onChange,
  onSubmit,
  loading
}: ProfileFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          Nom d'utilisateur
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 
                   focus:ring focus:ring-blue-200 transition-all"
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
          Prénom
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 
                   focus:ring focus:ring-blue-200 transition-all"
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 
                   focus:ring focus:ring-blue-200 transition-all"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 
                 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] 
                 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center 
                 justify-center gap-2"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        Enregistrer
      </button>
    </form>
  );
};
import { Save } from 'lucide-react';

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

export const ProfileForm = ({ formData, onChange, onSubmit, loading }: ProfileFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Prénom
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={onChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#266CDD]/20 focus:border-[#266CDD] transition-all"
            placeholder="Votre prénom"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nom
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={onChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#266CDD]/20 focus:border-[#266CDD] transition-all"
            placeholder="Votre nom"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nom d'utilisateur
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={onChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#266CDD]/20 focus:border-[#266CDD] transition-all"
          placeholder="Nom d'utilisateur"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#266CDD] text-white py-3.5 rounded-xl font-medium hover:bg-[#266CDD]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        <Save className="h-5 w-5" />
        <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
      </button>
    </form>
  );
};
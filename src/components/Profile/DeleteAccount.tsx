import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteAccountProps {
  onDelete: () => void;
}

export const DeleteAccount = ({ onDelete }: DeleteAccountProps) => {
  return (
    <div className="px-6 pb-6">
      <button
        onClick={onDelete}
        className="w-full bg-rose-50 text-rose-600 py-4 px-6 rounded-xl font-medium 
                 hover:bg-rose-100 active:bg-rose-200 transition-all 
                 flex items-center justify-center gap-3 group border-2 border-rose-100"
      >
        <Trash2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
        <span>Supprimer le compte</span>
      </button>
    </div>
  );
};
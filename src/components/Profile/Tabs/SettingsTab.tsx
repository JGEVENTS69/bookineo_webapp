import React from 'react';
import { Crown, Trash2 } from 'lucide-react';

interface SettingsTabProps {
  subscription: string;
  onDeleteAccount: () => void;
  onUpgrade: () => void;
}

export const SettingsTab = ({ subscription, onDeleteAccount, onUpgrade }: SettingsTabProps) => {
  const isFreemium = subscription === 'Freemium';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan actuel</h3>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown className={`h-6 w-6 ${isFreemium ? 'text-gray-400' : 'text-amber-500'}`} />
                <span className="font-semibold text-lg">
                  {isFreemium ? 'Plan Freemium' : 'Plan Premium'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-500">
                {isFreemium ? 'Gratuit' : '9.99€/mois'}
              </span>
            </div>
            
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                • {isFreemium ? '5 boîtes à livres maximum' : 'Boxes illimitées'}
              </li>
              <li className="flex items-center gap-2">
                • {isFreemium ? '5 boîtes en favoris maximum' : 'Favoris illimités'}
              </li>
              <li className="flex items-center gap-2">
                • {isFreemium ? '5 avis et évalutaions maximum' : 'Favoris illimités'}
              </li>
              {!isFreemium && (
                <li className="flex items-center gap-2">
                  • Support prioritaire
                </li>
              )}
            </ul>
          </div>

          {isFreemium && (
            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white 
                       py-3 px-6 rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 
                       active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25"
            >
              Passer au plan Premium
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone de danger</h3>
          <button
            onClick={onDeleteAccount}
            className="w-full bg-rose-50 text-rose-600 py-3 px-6 rounded-xl font-medium 
                     hover:bg-rose-100 active:bg-rose-200 transition-all flex items-center 
                     justify-center gap-2 group border-2 border-rose-100"
          >
            <Trash2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span>Supprimer le compte</span>
          </button>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Package2, Search } from 'lucide-react';

interface Box {
  id: string;
  title: string;
  description: string;
  created_at: string;
  likes_count: number;
}

export const BoxesTab = () => {
  // Exemple de données pour la démonstration
  const boxes: Box[] = [
    {
      id: '1',
      title: 'Ma première box',
      description: 'Une collection de livres fantastiques',
      created_at: '2024-03-10',
      likes_count: 42
    },
    {
      id: '2',
      title: 'Lectures d\'été',
      description: 'Sélection parfaite pour les vacances',
      created_at: '2024-03-08',
      likes_count: 28
    }
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher une box..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 
                   focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>

      {boxes.length > 0 ? (
        <div className="space-y-4">
          {boxes.map((box) => (
            <div
              key={box.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-gray-900">{box.title}</h3>
                  <p className="text-gray-600">{box.description}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(box.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span>{box.likes_count} likes</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune box</h3>
          <p className="mt-2 text-gray-600">Vous n'avez pas encore créé de box.</p>
        </div>
      )}
    </div>
  );
};
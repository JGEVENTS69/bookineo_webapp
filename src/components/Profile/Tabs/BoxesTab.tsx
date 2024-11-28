import React, { useState, useEffect } from 'react';
import { Package2, Search, Heart } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

interface Box {
  id: string;
  title: string;
  description: string;
  created_at: string;
  likes_count: number;
  image_url?: string;
}

export const BoxesTab = () => {
  const { user } = useAuthStore();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBoxes = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        console.log('Récupération des boxes pour l\'utilisateur:', user.id); // Debug

        const { data, error } = await supabase
          .from('book_boxes')
          .select('*')
          .eq('creator_id', user.id);

        if (error) {
          console.error('Erreur Supabase:', error); // Debug
          throw error;
        }

        console.log('Données reçues:', data); // Debug
        setBoxes(data || []);
      } catch (error: any) {
        console.error('Erreur détaillée:', error);
        toast.error('Impossible de charger vos boxes');
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, [user?.id]);

  const filteredBoxes = boxes.filter(box =>
    box.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    box.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une box..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 
                     focus:border-blue-500 focus:ring focus:ring-blue-300 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>

      {filteredBoxes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoxes.map((box) => (
            <div
              key={box.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-xl transition-transform"
            >
              <div className="relative w-full h-48 bg-gray-100">
                {box.image_url ? (
                  <img
                    src={box.image_url}
                    alt={box.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '';
                      target.onerror = null;
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full animate-pulse">
                    <Package2 className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{box.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-2">{box.description}</p>
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <span>
                    {new Date(box.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Heart className="h-5 w-5 text-rose-500" />
                    <span>{box.likes_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchQuery ? 'Aucun résultat' : 'Aucune box'}
          </h3>
          <p className="mt-2 text-gray-600">
            {searchQuery
              ? 'Aucune box ne correspond à votre recherche.'
              : 'Vous n\'avez pas encore créé de box.'}
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { BookBox } from '../types';
import Button from '../components/Button';
import { BookOpen, Heart, Trash2, PenSquare, Eye, Search, Navigation, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const MyBoxes = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState<BookBox[]>([]);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<BookBox[]>([]);
  const [activeTab, setActiveTab] = useState<'my-boxes' | 'favorites'>('my-boxes');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State pour la barre de recherche

  useEffect(() => {
    const fetchBoxesAndVisits = async () => {
      if (!user?.id) {
        console.log('No user ID found');
        return;
      }

      try {
        setLoading(true);

        // Fetch user-created boxes
        const { data: boxesData, error: boxesError } = await supabase
          .from('book_boxes')
          .select('*')
          .eq('creator_id', user.id);

        if (boxesError) throw boxesError;

        if (!boxesData || boxesData.length === 0) {
          setBoxes([]);
          setVisitCounts({});
          return;
        }

        // Fetch visit counts for all user boxes
        const boxIds = boxesData.map((box) => box.id);
        const { data: visitsData, error: visitsError } = await supabase
        .from('box_visits')
        .select('box_id, count')
        .in('box_id', boxIds)
        .select('box_id');

        if (visitsError) {
          console.error('Error fetching visits:', visitsError);
          throw visitsError;
        }

        // Map visit counts to box IDs
         const visitsMap = boxIds.reduce((acc: Record<string, number>, boxId) => {
          acc[boxId] = visitsData?.filter(visit => visit.box_id === boxId).length || 0;
          return acc;
        }, {});

        setBoxes(boxesData);
        setVisitCounts(visitsMap);
      } catch (error) {
        console.error('Error fetching boxes or visits:', error);
        toast.error('Impossible de charger vos boîtes.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select(`
            book_boxes (*)
          `)
          .eq('user_id', user.id);

        if (favoritesError) throw favoritesError;

        setFavorites(favoritesData?.map((f) => f.book_boxes) || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Impossible de charger vos favoris.');
      }
    };

    fetchBoxesAndVisits();
    fetchFavorites();
  }, [user?.id]);

  const handleDelete = async (boxId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette boîte à livres ?')) {
      return;
    }

    try {
      const { error } = await supabase.from('book_boxes').delete().eq('id', boxId);

      if (error) throw error;

      setBoxes(boxes.filter((box) => box.id !== boxId));
      toast.success('Boîte à livres supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleRemoveFavorite = async (boxId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('box_id', boxId);

      if (error) throw error;

      setFavorites(favorites.filter((box) => box.id !== boxId));
      toast.success('Retiré des favoris');
    } catch (error) {
      toast.error('Erreur lors du retrait des favoris.');
    }
  };

  // Filtrage des boîtes selon la barre de recherche
  const filteredBoxes =
    activeTab === 'my-boxes'
      ? boxes.filter((box) =>
          box.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : favorites.filter((box) =>
          box.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'my-boxes'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('my-boxes')}
          >
            Mes boîtes
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'favorites'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('favorites')}
          >
            Mes Favoris
          </button>
        </div>
      </div>

      {/* Barre de recherche en dessous des boutons */}
<div className="relative mb-6 w-full md:w-96 mx-auto">
  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
  <input
    type="text"
    placeholder="Rechercher une boîte..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none w-full"
  />
</div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoxes.map((box) => (
            <div
              key={box.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {box.image_url ? (
                <img
                  src={box.image_url}
                  alt={box.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{box.name}</h3>
    
                <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" /> {/* Icône avant la date */}
                Ajoutée le {new Date(box.created_at).toLocaleDateString()}
              </p>
                <div className="text-sm text-gray-500 flex items-center mt-1 mb-4">
                    <Navigation className="h-4 w-4 mr-2 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">
                      Nombres de visites:  {visitCounts[box.id] || 0}
                    </span>
                  </div>
                <div className="flex justify-between items-center">
                  <Button size="sm" onClick={() => navigate(`/box/${box.id}`)}>
                    Voir les détails
                  </Button>
                  {activeTab === 'my-boxes' ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/edit-box/${box.id}`)}
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDelete(box.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRemoveFavorite(box.id)}
                    >
                      <Heart className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBoxes;
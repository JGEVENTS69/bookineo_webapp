import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { BookBox } from '../types';
import Button from '../components/Button';
import { BookOpen, Search, Navigation, Calendar, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const MyVisits = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<BookBox[]>([]);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State pour la barre de recherche

  useEffect(() => {
    const fetchVisits = async () => {
      if (!user?.id) {
        console.log('No user ID found');
        return;
      }

      try {
        setLoading(true);

        // Fetch visited boxes
        const { data: visitsData, error: visitsError } = await supabase
          .from('box_visits')
          .select(`
            box_id,
            book_boxes (*),
            visited_at,
            comment,
            rating
          `)
          .eq('visitor_id', user.id);

        if (visitsError) throw visitsError;

        console.log('Visits Data:', visitsData); // Log des données récupérées

        if (!visitsData || visitsData.length === 0) {
          setVisits([]);
          setVisitCounts({});
          return;
        }

        // Map visit counts to box IDs
        const visitsMap = visitsData.reduce((acc: Record<string, number>, visit) => {
          acc[visit.box_id] = (acc[visit.box_id] || 0) + 1;
          return acc;
        }, {});

        setVisits(visitsData);
        setVisitCounts(visitsMap);
      } catch (error) {
        console.error('Error fetching visits:', error);
        toast.error('Impossible de charger vos visites.');
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [user?.id]);

  // Filtrage des boîtes selon la barre de recherche
  const filteredVisits = visits.filter((visit) =>
    visit.book_boxes.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Mes Visites</h2>
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
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisits.map((visit) => (
            <div
              key={visit.box_id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer relative"
              onClick={() => navigate(`/box/${visit.box_id}`)}
            >
              <div className="relative">
                {visit.book_boxes.image_url ? (
                  <img
                    src={visit.book_boxes.image_url}
                    alt={visit.book_boxes.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-7 w-7 ${i < visit.rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl text-primary font-bold mb-3">{visit.book_boxes.name}</h3>
                {visit.comment ? (
                  <p className="text-sm text-gray-600 mt-2">"{visit.comment}"</p>
                ) : (
                  <p className="text-sm text-gray-600 mt-2 italic">Vous n’avez pas ajouté de commentaires.</p>
                )}
                <div className="text-sm text-gray-500 flex items-center mt-5 mb-4">
                  <Navigation className="h-4 w-4 mr-2 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    Visitée le {new Date(visit.visited_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVisits;

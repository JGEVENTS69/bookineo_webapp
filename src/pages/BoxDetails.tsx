import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { BookBox, Visit } from '../types';
import { BookOpen, Navigation, User, Star, Clock, MapPin, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, LayersControl } from 'react-leaflet';
import Button from '../components/Button';
import L from 'leaflet';
import toast from 'react-hot-toast';

const VisitModal = ({ isOpen, onClose, onSubmit, loading }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  loading: boolean;
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-xl font-semibold mb-4">Noter cette boîte à livres</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`p-2 ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
              rows={4}
              placeholder="Partagez votre expérience..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button onClick={() => onSubmit(rating, comment)} isLoading={loading}>Enregistrer</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BoxDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [box, setBox] = useState<BookBox | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBoxAndVisits = async () => {
      try {
        const { data: boxData, error: boxError } = await supabase
          .from('book_boxes')
          .select('*')
          .eq('id', id)
          .single();

        if (boxError) throw boxError;
        setBox(boxData);

        const { data: visitsData, error: visitsError } = await supabase
          .from('box_visits')
          .select(`
            *,
            visitor:users (
              username,
              avatar_url
            )
          `)
          .eq('box_id', id)
          .order('visited_at', { ascending: false });

        if (visitsError) throw visitsError;
        setVisits(visitsData || []);

        if (user) {
          const { data: visitData } = await supabase
            .from('box_visits')
            .select('*')
            .eq('box_id', id)
            .eq('visitor_id', user.id)
            .maybeSingle();
          setHasVisited(!!visitData);

          const { data: favoriteData } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('box_id', id)
            .maybeSingle();
          setIsFavorite(!!favoriteData);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement de la boîte à livres');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBoxAndVisits();
  }, [id, user, navigate]);

  const handleVisitSubmit = async (rating: number, comment: string) => {
    if (!user || !id) return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('box_visits')
        .insert([{ box_id: id, visitor_id: user.id, rating, comment: comment.trim() || null }]);
      if (error) throw error;

      toast.success('Visite enregistrée !');
      setHasVisited(true);
      setIsVisitModalOpen(false);

      const { data: newVisits } = await supabase
        .from('box_visits')
        .select(`
          *,
          visitor:users (
            username,
            avatar_url
          )
        `)
        .eq('box_id', id)
        .order('visited_at', { ascending: false });
      setVisits(newVisits || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('box_id', id);
        setIsFavorite(false);
        toast.success('Retiré des favoris');
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, box_id: id }]);
        setIsFavorite(true);
        toast.success('Ajouté aux favoris');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const customIcon = L.icon({
    iconUrl: 'https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Marker.svg?t=2024-12-01T17%3A20%3A00.235Z', // Remplacez par l'URL de votre icône
    iconSize: [38, 38], // Taille de l'icône [largeur, hauteur]
    iconAnchor: [19, 38], // Point d'ancrage de l'icône (au centre inférieur)
    popupAnchor: [0, -38], // Point où le popup est affiché par rapport à l'icône
  });

  if (loading || !box) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="relative rounded-lg overflow-hidden shadow-lg">
        {box.image_url ? (
          <img src={box.image_url} alt={box.name} className="w-full h-64 object-cover" />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <img src="https://example.com/youhttps://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Marker.svg?t=2024-12-01T17%3A20%3A00.235Zr-icon-url.png" alt="Book icon" className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {user && (
          <button
            onClick={toggleFavorite}
            className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Star className={`h-6 w-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </button>
        )}
      </div>

      <div className="bg-white p-5 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2"> 
          <img
            src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Icon-Logo-Vert.png"
            className="h-8 w-8 text-gray-600"
          />
          <h1 className="text-3xl text-primary font-bold">{box.name}</h1>
        </div>
        <h3 className="text-xl font-semibold mt-6">Description de la boîte à livres :</h3>
        <p className="text-gray-700 mt-4">{box.description}</p>
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600 mt-8">
          <Clock className="h-4 w-4" />
          <span>Ajoutée le {new Date(box.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
  <User className="h-4 w-4" />
  <span>Par {box.creator_username || 'Utilisateur inconnu'}</span>
</div>
      </div>

      <div className="h-64 bg-white rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={[box.latitude, box.longitude]}
          zoom={17}
          className="h-full"
          scrollWheelZoom={false}
          zoomControl={false}
          doubleClickZoom={false}
          keyboard={false}
          touchZoom={false}
        >
          <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
          <Marker position={[box.latitude, box.longitude]} icon={customIcon} />
        </MapContainer>
      </div>

      {user && (
  <div className="flex flex-col space-y-2">
    {!hasVisited && (
      <Button onClick={() => setIsVisitModalOpen(true)} fullWidth>
        Marquer comme visité
      </Button>
    )}
    <Button
      onClick={() =>
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${box.latitude},${box.longitude}`,
          '_blank'
        )
      }
      fullWidth
      variant='secondary'
  >
      S'y rendre
    </Button>
  </div>
)}

      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        onSubmit={handleVisitSubmit}
        loading={isSubmitting}
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Avis et visites</h2>
        {visits.length > 0 ? (
          visits.map((visit) => (
            <div key={visit.id} className="bg-white rounded-lg shadow-md p-4 flex items-start space-x-4">
              <div className="shrink-0">
                {visit.visitor.avatar_url ? (
                  <img
                    src={visit.visitor.avatar_url}
                    alt={visit.visitor.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{visit.visitor.username}</h3>
                  <div className="flex space-x-1 text-yellow-400">
                    {[...Array(visit.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{visit.comment}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Visité le {new Date(visit.visited_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucune visite enregistrée pour l'instant.</p>
        )}
      </div>
    </div>
  );
};

export default BoxDetails;
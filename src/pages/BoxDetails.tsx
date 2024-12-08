import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { BookBox, Visit } from '../types';
import { BookOpen, Star, X, Navigation, ArrowLeft, Heart } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Button from '../components/Button';
import L from 'leaflet';
import toast from 'react-hot-toast';

const VisitModal = ({ isOpen, onClose, onSubmit, loading }) => {
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
                  className="p-2"
                >
                  {value <= rating ? (
                    <Star className="h-6 w-6 text-yellow-400 fill-current" />
                  ) : (
                    <Star className="h-6 w-6 text-gray-300" />
                  )}
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
  const [hasVisited, setHasVisited] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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
            .filter('rating', 'not.is', null)
            .maybeSingle();

          setHasVisited(!!visitData);

          const { data: favoriteData } = await supabase
            .from('favorites')
            .select('*')
            .eq('box_id', id)
            .eq('user_id', user.id)
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

    const zoomControl = document.querySelector(".leaflet-control-zoom");
    if (zoomControl) {
      zoomControl.style.display = "none";
    }
    
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

  const handleFavorite = async () => {
    if (!user || !id) return;
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('box_id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        setIsFavorite(false);
        toast.success('Boîte retirée de vos favoris');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ box_id: id, user_id: user.id }]);
        if (error) throw error;
        setIsFavorite(true);
        toast.success('Boîte ajoutée à vos favoris');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openGoogleMaps = () => {
    if (box) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(box.address)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const customIcon = L.icon({
    iconUrl: 'https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Marker.svg',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
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
      <button
        onClick={() => navigate(-1)} // Navigue vers la page précédente
        className="flex items-center text-primary mb-4"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Retour
      </button>
      <div className="relative rounded-lg overflow-hidden shadow-lg">
        <button
          onClick={handleFavorite}
          className="absolute flex items-center justify-center top-4 right-4 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <Heart className={`h-7 w-7 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`} />
        </button>
        <img src={box.image_url || 'https://via.placeholder.com/300'} alt={box.name} className="w-full h-64 object-cover" />
      </div>

      <div className="bg-white p-5 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <img
            src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Icon-Logo-Vert.png"
            className="h-8 w-8 text-gray-600"
          />
          <h1 className="text-2xl text-primary font-bold">{box.name}</h1>
        </div>
        <h3 className="text-base font-semibold mt-4">Description de la boîte à livres :</h3>
        <p className="text-gray-700 text-base mt-1">{box.description || 'Aucune description disponible.'}</p>
        <h2 className="text-base font-semibold mt-4 mb-4">Localisation de la Boîte à Livres</h2>
        <MapContainer center={[box.latitude, box.longitude]} zoom={16} style=
        {{ height: "180px", width: "100%", borderRadius: "15px", overflow: "hidden" }}
        doubleClickZoom={false} // Désactive le zoom par double-clic
        zoomControl={false}
      >
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[box.latitude, box.longitude]} icon={customIcon}>
          </Marker>
        </MapContainer>

        <div className="mt-8 flex items-center justify-center space-x-4">
          <Button
            onClick={() => setIsVisitModalOpen(true)}
            disabled={hasVisited}
          >
            {hasVisited ? "Déjà visité" : "Marquer comme visité"}
          </Button>
          <Button
            variant="outline"
            onClick={openGoogleMaps}
          >
            <Navigation className="mr-2 h-4 w-4" /> S'y rendre
          </Button>
        </div>
      </div>


      <div className="bg-white p-5 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Visites et Avis</h2>
        <ul className="space-y-4 rounded-lg bg-gray-100/70 p-2 px-4">
          {visits.map((visit) => (
            <li key={visit.id} className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                {visit.visitor.avatar_url ? (
                  <img src={visit.visitor.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {`${visit.visitor.username?.[0] || ''}${visit.visitor.username?.[1] || ''}`}
                  </div>
                )}
              </div>
              <div>
                <p
                  className="font-semibold text-primary cursor-pointer"
                  onClick={() => navigate(`/user/${visit.visitor.username}`)}
                >
                  {visit.visitor.username}
                </p>
                <div className="flex space-x-1 text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < visit.rating ? 'fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mt-1">{visit.comment || "J'ai visité cette boîte à livres."}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        onSubmit={handleVisitSubmit}
        loading={isSubmitting}
      />
    </div>
  );
};

export default BoxDetails;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';
import L from 'leaflet';
import { Upload, AlertCircle, LocateFixed, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (latlng: L.LatLng) => void }) => {
  const [marker, setMarker] = useState<L.LatLng | null>(null);

  // Création d'une icône personnalisée
  const customIcon = L.icon({
    iconUrl: 'https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Marker.svg', // Remplacez par l'URL de votre icône
    iconSize: [25, 41], // Dimensions de l'icône [largeur, hauteur]
    iconAnchor: [22, 45], // Point d'ancrage de l'icône (normalement la base)
  });

  useMapEvents({
    click(e) {
      setMarker(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return marker ? <Marker position={marker} icon={customIcon} /> : null;
};

const GeolocationButton = ({ onLocationFound }: { onLocationFound: (location: LatLng) => void }) => {
  const map = useMap();

  const handleGeolocation = () => {
    map.locate().on('locationfound', (e) => {
      const { lat, lng } = e.latlng;
      map.setView([lat, lng], 15);
      onLocationFound(e.latlng);
    }).on('locationerror', (e) => {
      toast.error('Impossible de récupérer votre position. Veuillez vérifier vos paramètres de géolocalisation.');
    });
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button 
          className="leaflet-control-geolocation bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-all flex items-center justify-center"
          onClick={handleGeolocation}
          title="Me localiser"
        >
          <LocateFixed className="flex-h-5 w-5 text-primary" />
        </button>
      </div>
    </div>
  );
};

const AddBox = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [boxCount, setBoxCount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334]);
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const checkBoxCount = async () => {
      const { count } = await supabase
        .from('book_boxes')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);
      
      setBoxCount(count || 0);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
        },
        (error) => {
          console.log('Géolocalisation non disponible, utilisation de la position par défaut');
        }
      );
    }

    checkBoxCount();
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFreemium = user?.subscription === 'Freemium';
  const boxLimit = isFreemium ? 5 : Infinity;
  const canAddBox = boxCount < boxLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAddBox) {
      toast.error('Vous avez atteint la limite de boîtes pour un compte Freemium');
      return;
    }

    if (!location) {
      toast.error('Veuillez sélectionner un emplacement sur la carte');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = null;
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `book-boxes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('book-boxes')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('book-boxes')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('book_boxes').insert([
        {
          name: formData.name,
          description: formData.description,
          latitude: location.lat,
          longitude: location.lng,
          image_url: imageUrl,
          creator_id: user?.id,
          creator_username: user?.username,
        },
      ]);

      if (error) throw error;

      toast.success('Boîte à livres ajoutée avec succès');
      navigate('/my-boxes');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!canAddBox) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Limite atteinte</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Vous avez atteint la limite de {boxLimit} boîtes pour un compte Freemium.
            Passez à Premium pour ajouter plus de boîtes !
          </p>
          <Button 
            onClick={() => navigate('/profile')}
            className="mx-auto"
          >
            Passer à Premium
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Colonne de formulaire */}
        <div>
          <h1 className="text-xl font-bold mb-8 flex items-center justify-center">
            Ajouter une boîte à livres
          </h1>

          {isFreemium && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-700">
                  Boîtes créées : {boxCount} / {boxLimit}
                </p>
                <span className="text-sm font-semibold text-primary">
                  {Math.round((boxCount / boxLimit) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary rounded-full transition-all"
                  style={{ width: `${(boxCount / boxLimit) * 100}%` }}
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border-2 border-primary rounded-xl shadow-xl p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boîte
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border-gray-300 pl-2 shadow-sm px-2 py-2 focus:border-primary focus:ring-primary"
                  placeholder="Nom descriptif de votre boîte"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg pl-2 py-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="Décrivez l'emplacement et les particularités de votre boîte"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors group">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary transition-colors" />
                        <div className="text-sm text-gray-600">
                          <span className="text-primary">Cliquez pour uploader</span> ou
                          glissez-déposez
                        </div>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="h-32 w-32">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Colonne de carte */}
        <div>
          <div className="bg-white border-2 border-primary rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 text-primary" />
              Emplacement
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cliquez sur la carte pour placer la boîte à livres
            </p>
            <div className="h-[500px] rounded-lg overflow-hidden relative">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                className="h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker onLocationSelect={setLocation} />
                <GeolocationButton 
                  onLocationFound={(latlng) => {
                    setLocation(latlng);
                  }} 
                />
              </MapContainer>
            </div>
            {location && (
              <div className="mt-4 text-sm text-gray-600">
                Coordonnées : {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/my-boxes')}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              isLoading={loading}
              onClick={handleSubmit}
              disabled={!location}
            >
              Ajouter la boîte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBox;
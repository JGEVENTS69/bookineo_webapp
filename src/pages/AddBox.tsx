import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L, { LatLng, DivIcon } from 'leaflet';
import { Upload, LocateFixed, MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import '../index.css'; // Inclure les styles pour l'icône pulsante

// Composant pour gérer le marqueur de sélection
const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (latlng: LatLng) => void }) => {
  const [marker, setMarker] = useState<LatLng | null>(null);

  const customIcon = L.icon({
    iconUrl: 'https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Marker.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useMapEvents({
    click(e) {
      setMarker(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return marker ? <Marker position={marker} icon={customIcon} /> : null;
};

// Composant pour afficher un marqueur pulsant à la position de l'utilisateur
const UserLocationMarker = ({ location }: { location: LatLng }) => {
  const userIcon = new DivIcon({
    className: 'user-location-marker',
    html: `
      <div class="pulse"></div>
      <div class="dot"></div>
    `,
    iconSize: [30, 30],
  });

  return <Marker position={location} icon={userIcon} />;
};

// Bouton pour géolocalisation
const GeolocationButton = ({ onLocationFound }: { onLocationFound: (location: LatLng) => void }) => {
  const map = useMap();

  const handleGeolocation = () => {
    map.locate()
      .on('locationfound', (e) => {
        const { lat, lng } = e.latlng;
        map.setView([lat, lng], 15);
        onLocationFound(e.latlng);
      })
      .on('locationerror', () => {
        toast.error('Impossible de récupérer votre position.');
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
          <LocateFixed className="h-5 w-5 text-primary" />
        </button>
      </div>
    </div>
  );
};

// Composant principal
const AddBox = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [boxCount, setBoxCount] = useState(0);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334]);
  const [mapZoom, setMapZoom] = useState(6);
  const [step, setStep] = useState(1); // Pour gérer les étapes du formulaire

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

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setUserLocation(L.latLng(latitude, longitude));
          setMapZoom(13);
        },
        () => {
          console.log('Géolocalisation non disponible, position par défaut utilisée.');
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
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast.error('Veuillez sélectionner un emplacement sur la carte.');
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

        const { data } = supabase.storage.from('book-boxes').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
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

      toast.success('Boîte à livres ajoutée avec succès !');
      navigate('/my-boxes');
    } catch (error) {
      toast.error('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl flex justify-center font-bold mb-6">Ajouter une boîte à livres</h1>

      {step === 1 && (
        <div className="container border-2 border-primary rounded-lg shadow-xl mx-auto px-4 py-4">
          <h2 className=" container mx-auto  text-white shadow-md px-4 py-4 max-w-5xl rounded-lg  bg-primary text-lg font-semibold mb-4">Étape 1: Informations sur la boîte</h2>
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                title="Le nom est obligatoire."
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div><label className="block text-sm font-medium text-gray-700 mb-2">Photo (obligatoire)</label>
            <div>
            <div className="flex items-center justify-center border border-dashed rounded-md p-4">
              <input type="file" className="hidden" id="upload" onChange={handleImageChange} required />
              <label
                htmlFor="upload"
                className="cursor-pointer text-gray-600 flex items-center space-x-2"
              >
                <Upload />
                <span>Choisir une image</span>
              </label>
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-40 object-cover rounded-md"
              />
            )}
            </div>
            <Button type="submit" className="w-full mt-6">Passer à l'étape suivante</Button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Étape 2: Sélectionnez l'emplacement</h2>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '400px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {userLocation && <UserLocationMarker location={userLocation} />}
            <LocationPicker onLocationSelect={setLocation} />
            <GeolocationButton onLocationFound={setUserLocation} />
          </MapContainer>
          <Button
            className="mt-6"
            onClick={() => setStep(1)}
          >
            Retour à l'étape 1
          </Button>
          <Button
            className="mt-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Enregistrement en cours...' : 'Valider'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddBox;

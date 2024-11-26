import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { Upload, AlertCircle, LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';

const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (latlng: LatLng) => void }) => {
  const [marker, setMarker] = useState<LatLng | null>(null);

  useMapEvents({
    click(e) {
      setMarker(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return marker ? <Marker position={marker} /> : null;
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
          className="leaflet-control-geolocation bg-white p-2 rounded shadow hover:bg-gray-100"
          onClick={handleGeolocation}
          title="Me localiser"
        >
          <LocateFixed className="h-5 w-5 text-primary" />
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

    // Vérifier le nombre de boîtes de l'utilisateur
    const checkBoxCount = async () => {
      const { count } = await supabase
        .from('book_boxes')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);
      
      setBoxCount(count || 0);
    };

    // Essayer de géolocaliser au chargement
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

  // ... (le reste du code reste identique)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ... (autres parties du code restent identiques) */}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Emplacement</h2>
        <p className="text-sm text-gray-600 mb-4">
          Cliquez sur la carte pour placer la boîte à livres
        </p>
        <div className="h-96 rounded-lg overflow-hidden relative">
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
      </div>

      {/* ... (autres parties du code restent identiques) */}
    </div>
  );
};

export default AddBox;
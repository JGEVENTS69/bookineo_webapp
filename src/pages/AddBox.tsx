import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import { LocationPicker } from '../components/AddBox/LocationPicker';
import { UserLocationMarker } from '../components/AddBox/UserLocationMarker';
import { GeolocationButton } from '../components/AddBox/GeolocationButton';
import { ImageUpload } from '../components/AddBox/ImageUpload';
import { StepIndicator } from '../components/AddBox/StepIndicator';
import 'leaflet/dist/leaflet.css';

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
  const [step, setStep] = useState(1);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Ajouter une boîte à livres
        </h1>
        <StepIndicator currentStep={step} totalSteps={2} />

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boîte
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Donnez un nom à votre boîte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                  placeholder="Décrivez votre boîte à livres..."
                />
              </div>

              <ImageUpload
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
              />

              <Button
                onClick={() => setStep(2)}
                className="w-full"
                disabled={!formData.name || !formData.description || !image}
              >
                Continuer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg overflow-hidden shadow-md">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  className="h-[400px] z-0"
                >
                  <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
                  {userLocation && <UserLocationMarker location={userLocation} />}
                  <LocationPicker onLocationSelect={setLocation} />
                  <GeolocationButton onLocationFound={setUserLocation} />
                </MapContainer>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Cliquez sur la carte pour sélectionner l'emplacement de votre boîte
              </p>

              <div className="flex flex-col space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Retour
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !location}
                  className="w-full"
                >
                  {loading ? 'Enregistrement...' : 'Valider'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBox;
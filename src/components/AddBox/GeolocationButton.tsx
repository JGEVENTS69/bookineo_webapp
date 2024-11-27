import { useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';

interface GeolocationButtonProps {
  onLocationFound: (location: LatLng) => void;
}

export const GeolocationButton = ({ onLocationFound }: GeolocationButtonProps) => {
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
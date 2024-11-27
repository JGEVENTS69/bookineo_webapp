import { useState } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import L, { LatLng } from 'leaflet';

interface LocationPickerProps {
  onLocationSelect: (latlng: LatLng) => void;
}

export const LocationPicker = ({ onLocationSelect }: LocationPickerProps) => {
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
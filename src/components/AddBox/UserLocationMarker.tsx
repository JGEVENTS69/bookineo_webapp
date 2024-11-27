import { Marker } from 'react-leaflet';
import { LatLng, DivIcon } from 'leaflet';

interface UserLocationMarkerProps {
  location: LatLng;
}

export const UserLocationMarker = ({ location }: UserLocationMarkerProps) => {
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
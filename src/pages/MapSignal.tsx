import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLng, Icon, DivIcon } from 'leaflet';
import { BookOpen, Crosshair, User, Plus, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BookBox } from '../types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from 'react-modal';

const useGeolocation = () => {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("La géolocalisation n'est pas supportée par votre navigateur");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(position);
            },
            (error) => {
                setError(error.message);
                toast.error('Erreur de géolocalisation: ' + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    };

    useEffect(() => {
        getLocation();
    }, []);

    return { location, error, getLocation };
};

const LocationButton = () => {
    const map = useMap();
    const { location, getLocation } = useGeolocation();

    const handleLocationClick = () => {
        getLocation();
        if (location) {
            map.flyTo([location.coords.latitude, location.coords.longitude], 15, {
                duration: 1.5,
            });
        } else {
            toast.error(
                'Veuillez autoriser la géolocalisation dans votre navigateur'
            );
        }
    };

    return (
        <div
            className="leaflet-top leaflet-right"
            style={{ marginTop: '10px', marginRight: '10px' }}
        >
            <div className="leaflet-control">
                <button
                    onClick={handleLocationClick}
                    className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    title="Me localiser"
                    style={{
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Crosshair className="h-6 w-6 text-gray-700" />
                </button>
            </div>
        </div>
    );
};

const MapSignal = () => {
    const [bookBoxes, setBookBoxes] = useState<BookBox[]>([]);
    const [loading, setLoading] = useState(true);
    const [markerIcon, setMarkerIcon] = useState<string | null>(null);
    const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportDescription, setReportDescription] = useState('');
    const { location } = useGeolocation();
    const navigate = useNavigate();

    const defaultPosition: LatLng = new LatLng(46.603354, 1.888334);
    const userPosition = location
        ? new LatLng(location.coords.latitude, location.coords.longitude)
        : null;

    useEffect(() => {
        const fetchBookBoxes = async () => {
            try {
                const {
                    data: { publicUrl },
                } = supabase.storage.from('assets').getPublicUrl('marker-icon.png');

                setMarkerIcon(publicUrl);

                const { data, error } = await supabase.from('book_boxes').select('*');

                if (error) throw error;
                setBookBoxes(data || []);
            } catch (error: any) {
                toast.error('Erreur lors du chargement des boîtes à livres');
            } finally {
                setLoading(false);
            }
        };

        fetchBookBoxes();
    }, []);

    const createBookBoxIcon = (isSelected: boolean) =>
        markerIcon
            ? new Icon({
                iconUrl:
                    'https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Marker.svg',
                iconSize: isSelected ? [60, 60] : [46, 46],
                popupAnchor: [0, -10],
            })
            : new DivIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #d8596e; width: ${isSelected ? '10px' : '8px'
                    }; height: ${isSelected ? '10px' : '8px'
                    }; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [8, 8],
            });

    const userIcon = new DivIcon({
        className: 'custom-pulse-icon',
        html: `
            <div class="pulse-icon"></div>
          `,
        iconSize: [12, 12], // Taille de l'icône
    });

    const style = document.createElement('style');
    style.innerHTML = `
  .custom-pulse-icon .pulse-icon {
    width: 12px;
    height: 12px;
    border-radius: 100%;
    background-color: #3a7c6a;
    box-shadow: 0 0 0 rgba(66, 133, 244, 0.4);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 rgba(66, 133, 244, 0.4);
    }
    30% {
      transform: scale(1.3);
      box-shadow: 0 0 10px rgba(66, 133, 244, 0.6);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 rgba(66, 133, 244, 0.4);
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    position: relative;
  }

  .modal-close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
  }
`;
    document.head.appendChild(style);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setReportDescription('');
    };

    const handleReportSubmit = () => {
        // Logique pour soumettre le rapport
        console.log('Report submitted:', reportDescription);
        closeModal();
    };

    const selectedBox = bookBoxes.find(box => box.id === selectedMarkerId);

    return (
        <div className="h-[calc(100vh-4rem)]">
            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <MapContainer
                    center={userPosition || defaultPosition}
                    zoom={userPosition ? 15 : 6}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <LocationButton />


                    <div className="leaflet-bottom w-full" style={{
                        position: 'absolute',
                        bottom: '24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}>
                        <div className="flex justify-center w-full mb-3">
                            <div className="text-base font-bold text-black">
                                Sélectionnez la boîte à signaler.
                            </div>
                        </div>
                    </div>


                    {userPosition && (
                        <Marker position={userPosition} icon={userIcon}>
                            <Popup>Vous êtes ici</Popup>
                        </Marker>
                    )}

                    {bookBoxes.map((box) => (
                        <Marker
                            key={box.id}
                            position={[box.latitude, box.longitude]}
                            icon={createBookBoxIcon(selectedMarkerId === box.id)}
                            eventHandlers={{
                                click: () => setSelectedMarkerId(box.id),
                            }}
                        >
                            <Popup>
                                <div className="w-70 bg-white rounded-2xl shadow-lg overflow-hidden">
                                    {box.image_url ? (
                                        <img
                                            src={box.image_url}
                                            alt={box.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                            <BookOpen className="h-14 w-14 text-gray-300" />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h3 className="flex items-center justify-center text-xl font-semibold text-primary">
                                            {box.name}
                                        </h3>
                                        <div className="flex items-center justify-center text-gray-500">
                                            <User className="h-5 w-5 mr-2 text-gray-400" />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    navigate(`/user/${box.creator_username}`);
                                                }}
                                                className="text-sm italic text-primary hover:underline"
                                            >
                                                Par {box.creator_username}
                                            </button>
                                        </div>
                                        <div className="flex justify-center mt-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openModal();
                                                }}
                                                className="bg-[#d8596e] text-sm text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center space-x-2"
                                            >
                                                <AlertCircle className="h-4 w-4" />
                                                <span>Signaler cette boîte à livre</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}

            {isModalOpen && selectedBox && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeModal}>
                            <X className="h-6 w-6 text-gray-700" />
                        </button>
                        <h2 className="text-xl font-semibold mb-5">Signaler la boîte à livre :</h2>
                        <div className="flex items-center space-x-2 mb-4">
                            <img
                                src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Icon-Logo-Vert.png"
                                className="h-7 w-7 text-gray-600"
                            />
                            <h1 className="text-2xl text-primary font-bold">{selectedBox.name}</h1>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-600 text-sm font-medium mb-2">
                                Précisez le problème rencontré.
                            </label>
                            <textarea
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary"
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mr-2"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleReportSubmit}
                                className="bg-primary text-white px-4 py-2 rounded-lg"
                            >
                                Soumettre
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default MapSignal;

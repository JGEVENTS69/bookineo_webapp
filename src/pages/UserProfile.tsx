import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, BookBox } from '../types';
import { BookOpen, User as UserIcon, Mail, Crown, MapPin, CheckCircle, ChevronDown, Star, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [boxes, setBoxes] = useState<BookBox[]>([]);
  const [visitedBoxes, setVisitedBoxes] = useState<any[]>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isBoxesDropdownOpen, setIsBoxesDropdownOpen] = useState(false);
  const [isVisitedBoxesDropdownOpen, setIsVisitedBoxesDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndBoxes = async () => {
      try {
        console.log('Fetching user data...');
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (userError) throw userError;
        setUser(userData);
        console.log('User data fetched:', userData);

        console.log('Fetching boxes data...');
        const { data: boxesData, error: boxesError } = await supabase
          .from('book_boxes')
          .select('*')
          .eq('creator_username', username)
          .order('created_at', { ascending: false });

        if (boxesError) throw boxesError;
        setBoxes(boxesData || []);
        console.log('Boxes data fetched:', boxesData);

        console.log('Fetching visited boxes data...');
        const { data: visitedBoxesData, error: visitedBoxesError } = await supabase
          .from('box_visits')
          .select('box_id, visited_at, comment, rating, book_boxes(id, name, image_url)')
          .eq('visitor_id', userData.id)
          .order('visited_at', { ascending: false });

        if (visitedBoxesError) throw visitedBoxesError;
        setVisitedBoxes(visitedBoxesData || []);
        console.log('Visited boxes data fetched:', visitedBoxesData);

        console.log('Fetching visit count...');
        const { count, error: visitsError } = await supabase
          .from('box_visits')
          .select('*', { count: 'exact', head: true })
          .eq('visitor_id', userData.id);

        if (visitsError) throw visitsError;
        setVisitCount(count || 0);
        console.log('Visit count fetched:', count);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement du profil');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBoxes();
  }, [username, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Utilisateur non trouvé</h1>
          <p className="text-gray-600">
            L'utilisateur que vous recherchez n'existe pas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative">
           <div className="w-full h-48 bg-slate-400 flex items-center justify-center">
            {user.banner_url ? (
              <img
                src={user.banner_url}
                alt="Banner"
                className="w-full h-48 object-cover"
              />
            ) : (
              <img 
              src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Logo-Blanc.png"
              className="w-80 h-35 opacity-40"
              />
            )}
            <div className="absolute -bottom-10 left-8 flex items-end space-x-4">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-primary flex items-center justify-center">
            {user.avatar_url ? (
             <img
               src={user.avatar_url}
                alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
             ) : (
           <img
             src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Icon-Logo-Blanc.png"
             alt="Default Avatar"
              className="w-14 h-14 mr-2 mt-1"
             />
           )}
          </div>
              <div className="mb-12">
                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                <div className="flex items-center text-white space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 mt-5">
            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-primary">Nom</h3>
                  <p className="mt-1 text-slate-900">{user.first_name || 'Non spécifié'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary">Prénom</h3>
                  <p className="mt-1 text-slate-900">{user.last_name || 'Non spécifié'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary">Pseudo Bookineo</h3>
                  <p className="mt-1 text-slate-900">{user.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary">Email</h3>
                  <p className="mt-1 text-slate-900">{user.email}</p>
                </div>
              </div>

              {/* Dropdown for Added Boxes */}
              <div className="pt-5">
                <button
                  onClick={() => setIsBoxesDropdownOpen(!isBoxesDropdownOpen)}
                  className="flex items-center bg-primary justify-between w-full px-4 py-2 text-left text-white hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <span className="font-medium text-white">Boîtes à livres ajoutées</span>
                    <span className="ml-2 text-lg font-bold text-white">({boxes.length})</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-white transition-transform duration-200 ${isBoxesDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isBoxesDropdownOpen && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boxes.map((box) => (
                      <div
                        key={box.id}
                        className="bg-white rounded-xl bg-primary shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/box/${box.id}`)}
                      >
                        {box.image_url ? (
                          <img
                            src={box.image_url}
                            alt={box.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{box.name}</h3>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <p className="text-sm">
                              {new Date(box.created_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown for Visited Boxes */}
              <div className="mt-8">
                <button
                  onClick={() => setIsVisitedBoxesDropdownOpen(!isVisitedBoxesDropdownOpen)}
                  className="flex items-center bg-primary justify-between w-full px-4 py-2 text-left text-white hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <span className="font-medium text-white">Boîtes à livres visitées</span>
                    <span className="ml-2 text-lg font-bold text-white">({visitCount})</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-white transition-transform duration-200 ${isVisitedBoxesDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isVisitedBoxesDropdownOpen && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visitedBoxes.map((visit) => (
                      <div
                        key={visit.box_id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/box/${visit.box_id}`)}
                      >
                        {visit.book_boxes.image_url ? (
                          <img
                            src={visit.book_boxes.image_url}
                            alt={visit.book_boxes.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{visit.book_boxes.name}</h3>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <p className="text-sm">
                              {new Date(visit.visited_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          {visit.comment && (
                            <p className="text-sm text-gray-600 mt-2">{visit.comment}</p>
                          )}
                          <div className="flex items-center mt-2">
                            {[...Array(visit.rating)].map((_, index) => (
                              <Star key={index} className="w-4 h-4 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

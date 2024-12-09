import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Map, User, LogOut, Menu, MenuSquare, Settings } from 'lucide-react';

const Navigation = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate(); // Hook pour la navigation
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 right-0 z-[9999] h-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <button
            onClick={() => {
              if (user) {
                navigate('/map'); // Redirige vers /map si connecté
              } else {
                navigate('/'); // Redirige vers / si non connecté
              }
            }}
            className="flex items-center"
          >
            <img
              src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Logo-Vert.png"
              alt="Logo Bookineo"
              className="h-12 w-30"
            />
          </button>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Menu pour utilisateurs non connectés */}
            {!user ? (
              <>
                <Link
                  to="/#features"
                  className="hidden md:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  Fonctionnalités
                </Link>
                <Link
                  to="/#pricing"
                  className="hidden md:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  Tarifs
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors duration-200"
                >
                  Connexion
                </Link>
              </>
            ) : (
              /* Dropdown pour utilisateurs connectés */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <MenuSquare className="h-8 w-8" />
                  <span className="ml-2 hidden md:inline">Menu</span>
                </button>

                {/* Dropdown Menu - uniquement pour utilisateurs connectés */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-[9999] transform origin-top-right transition-all duration-200 ease-out">
                    <div className="py-3">
                      <Link
                        to="/map"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Map className="h-5 w-5 mr-2" />
                        Carte
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="h-5 w-5 mr-2" />
                        Profil
                      </Link>
                      <Link
                        to="/my-boxes"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <BookOpen className="h-5 w-5 mr-2" />
                        Mes boîtes
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="h-5 w-5 mr-2" />
                        Paramètres
                      </Link>
                      <div className="flex justify-center border-t border-gray-100">
                        <button
                          onClick={() => {
                            signOut();
                            setIsDropdownOpen(false);
                          }}
                          className="inline-flex items-center mt-8 mb-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors duration-200"
                        >
                          <LogOut className="h-5 w-5 mr-2" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

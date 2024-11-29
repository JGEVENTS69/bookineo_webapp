import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Map, User, LogOut, MenuSquare, X, MessageCircleX, Circle, XCircle } from 'lucide-react';
import { BiCloset } from 'react-icons/bi';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16 mt-16">{children}</main>
    </div>
  );
};

const Navigation = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);  // Added state for sidebar
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
          <Link to="/" className="flex items-center">
            <img
              src="https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Logo-Vert.png"
              alt="Logo Bookineo"
              className="h-12 w-30"
            />
          </Link>

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
                  onClick={() => setSidebarOpen(!isSidebarOpen)}  // Toggle sidebar on click
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                  aria-expanded={isSidebarOpen}
                  aria-haspopup="true"
                >
                  <MenuSquare className="h-8 w-8" />
                  <span className="ml-2 hidden md:inline">Menu</span>
                </button>

                {/* Sidebar Menu - Menu Latéral */}
                {isSidebarOpen && (
                  <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 z-[9998]"
                    onClick={() => setSidebarOpen(false)}  // Close sidebar when clicking outside
                  />
                )}

                <div
                  className={`fixed right-0 top-0 w-64 h-full bg-white shadow-lg z-[9999] transform transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                  }`}
                >
                  <div className="flex justify-between items-center px-4 py-4">
                  <span className="text-2xl text-primary font-semibold">Menu</span>
                    <button
                      onClick={() => setSidebarOpen(false)}  // Close sidebar on button click
                      className="text-[#d8596e]"
                    >
                      <XCircle className="h-8 w-8" />
                    </button>
                  </div>

                  <div className="py-3 space-y-3">
                    <Link
                      to="/map"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Map className="h-5 w-5 mr-2" />
                      Carte
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Profil
                    </Link>
                    <Link
                      to="/my-boxes"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      Mes boîtes
                    </Link>
                    <div className="flex justify-center border-t border-gray-100">
                      <button
                        onClick={() => {
                          signOut();
                          setSidebarOpen(false);
                        }}
                        className="inline-flex items-center mt-8 mb-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors duration-200"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
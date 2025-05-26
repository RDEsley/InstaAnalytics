import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Instagram, History, User } from 'lucide-react';
import { useAuthStore } from '../store/auth';

const Header: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Instagram className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">InstaAnalytics</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            to="/settings"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            Settings
          </Link>
          {user && (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  {user.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{user.user_metadata?.name || user.email?.split('@')[0]}</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Instagram className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/settings"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Link>
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <History className="h-5 w-5 mr-2" />
              Search History
            </Link>
            <Link
              to="/settings"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-5 w-5 mr-2" />
              Profile
            </Link>
            <button
              onClick={() => {
                handleSignOut();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAnalyticsStore } from '../store/analytics';
import { validateInstagramHandle } from '../lib/api';

const SearchBar: React.FC = () => {
  const [username, setUsername] = useState('');
  const { fetchProfile, loading } = useAnalyticsStore();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter an Instagram username');
      return;
    }

    if (!validateInstagramHandle(username.trim())) {
      toast.error('Invalid Instagram username format');
      return;
    }

    try {
      await fetchProfile(username.trim());
      setUsername('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch Instagram profile');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative rounded-lg shadow-sm overflow-hidden bg-white">
        <form onSubmit={handleSearch} className="flex">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Instagram username"
            className="block w-full pl-10 pr-20 py-3 text-gray-900 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Analyze</span>
            )}
          </button>
        </form>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Enter any public Instagram username to generate analytics
      </p>
    </div>
  );
};

export default SearchBar;
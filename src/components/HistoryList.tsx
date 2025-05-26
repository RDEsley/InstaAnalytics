import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Instagram, Clock } from 'lucide-react';
import { useAnalyticsStore } from '../store/analytics';

const HistoryList: React.FC = () => {
  const { searchHistory, fetchProfileData } = useAnalyticsStore();
  const navigate = useNavigate();
  
  const handleProfileClick = async (profileId: string) => {
    await fetchProfileData(profileId);
    navigate(`/profile/${profileId}`);
  };
  
  if (searchHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search History</h2>
        <div className="text-center py-8">
          <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No search history yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Search for Instagram profiles to see them here
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Search History</h2>
      <div className="divide-y divide-gray-200">
        {searchHistory.slice(0, 5).map((profile) => (
          <div 
            key={profile.id}
            className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded cursor-pointer"
            onClick={() => handleProfileClick(profile.id)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">@{profile.instagram_username}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{format(new Date(profile.search_date), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <div>
              <button
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProfileClick(profile.id);
                }}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
      {searchHistory.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All History
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryList;
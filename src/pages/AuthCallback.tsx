import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth callback
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error during OAuth callback:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-blue-400 h-12 w-12"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-blue-400 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-blue-400 rounded"></div>
            <div className="h-4 bg-blue-400 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
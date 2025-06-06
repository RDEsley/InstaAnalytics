"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, Check } from 'lucide-react';

import InstagramForm from '@/components/InstagramForm';
import LoadingIndicator from '@/components/LoadingIndicator';
import AnalysisResults from '@/components/AnalysisResults';
import SearchHistory from '@/components/SearchHistory';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalysisResult, SearchHistoryFilters, SearchHistoryEntry } from '@/lib/types';
import { getSearchHistory } from '@/lib/supabase';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [totalHistoryPages, setTotalHistoryPages] = useState(1);
  const [historyFilters, setHistoryFilters] = useState<SearchHistoryFilters>({
    page: 1,
    limit: 5,
    orderBy: 'timestamp',
    orderDirection: 'desc'
  });

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setStartTime(Date.now());
    setError(null);
  };

  const handleAnalysisComplete = (data: AnalysisResult) => {
    setIsAnalyzing(false);
    setAnalysisResult(data);
    loadSearchHistory(historyFilters);
  };

  const handleError = (errorMessage: string) => {
    setIsAnalyzing(false);
    setError(errorMessage);
    setAnalysisResult(null);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  const loadSearchHistory = async (filters: SearchHistoryFilters) => {
    try {
      const { entries, total } = await getSearchHistory(filters);
      setSearchHistory(entries);
      setTotalHistoryPages(Math.ceil(total / filters.limit));
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const handleHistoryFiltersChange = (newFilters: SearchHistoryFilters) => {
    setHistoryFilters(newFilters);
    loadSearchHistory(newFilters);
  };

  // Load initial search history
  useEffect(() => {
    loadSearchHistory(historyFilters);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IA</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">InstaAnalytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Dashboard</span>
              <span className="text-sm text-gray-500">Settings</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">R</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Richard</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {!analysisResult ? (
                <motion.div
                  key="welcome-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Welcome Section */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome, Richard!
                    </h1>
                    <p className="text-gray-600">
                      Enter an Instagram username to get detailed analytics and insights
                    </p>
                  </div>

                  {/* Search Form */}
                  <InstagramForm 
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onError={handleError}
                  />

                  {/* Error Alert */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* Loading Indicator */}
                  {isAnalyzing && (
                    <LoadingIndicator startTime={startTime} />
                  )}

                  {/* Start Analysis Card */}
                  {!isAnalyzing && !error && (
                    <Card className="text-center py-12">
                      <CardContent className="space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Zap className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Start Your Analysis
                          </h3>
                          <p className="text-gray-600 max-w-md mx-auto">
                            Enter an Instagram username in the search bar above to analyze profiles, posts, and engagement metrics.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="results-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AnalysisResults 
                    data={analysisResult} 
                    onReset={handleReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search History</CardTitle>
              </CardHeader>
              <CardContent>
                {searchHistory.length > 0 ? (
                  <div className="space-y-3">
                    {searchHistory.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">@{entry.username}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          entry.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                    ))}
                    {searchHistory.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{searchHistory.length - 3} more searches
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-gray-400 text-xl">⌕</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No search history yet</p>
                    <p className="text-xs text-gray-500">
                      Search for Instagram profiles to see them here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Premium Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    'Advanced sentiment analysis',
                    'Competitor comparison',
                    'Post performance tracking',
                    'Audience insights',
                    'Hashtag effectiveness'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Search History Section */}
        {searchHistory.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Search History</h2>
            <SearchHistory
              entries={searchHistory}
              filters={historyFilters}
              onFiltersChange={handleHistoryFiltersChange}
              totalPages={totalHistoryPages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
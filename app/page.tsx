"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, Check } from 'lucide-react';

import InstagramForm from '@/components/InstagramForm';
import LoadingIndicator from '@/components/LoadingIndicator';
import AnalysisResults from '@/components/AnalysisResults';
import SearchHistory from '@/components/SearchHistory';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalysisResult, SearchHistoryFilters, SearchHistoryEntry } from '@/lib/types';
import { getSearchHistory, clearSearchHistory, storeFailedSearch } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
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

  const handleError = async (errorMessage: string, username?: string) => {
    setIsAnalyzing(false);
    setError(errorMessage);
    setAnalysisResult(null);
    
    // Store failed search in history if username is provided
    if (username) {
      await storeFailedSearch(username, errorMessage);
      loadSearchHistory(historyFilters);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  const handleHistoryClick = (entry: SearchHistoryEntry) => {
    if (entry.result && entry.status === 'success') {
      setAnalysisResult(entry.result);
      setError(null);
    }
  };

  const handleClearHistory = async () => {
    const success = await clearSearchHistory();
    if (success) {
      setSearchHistory([]);
      setTotalHistoryPages(1);
    }
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
    if (user) {
      loadSearchHistory(historyFilters);
    }
  }, [user]);

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen relative dashboard-background">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/50 via-slate-300/50 to-slate-400/50"></div>

        {/* Content */}
        <div className="relative z-10">
          <Header />

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
                          Bem-vindo, {getUserDisplayName()}!
                        </h1>
                        <p className="text-gray-600">
                          Digite um nome de usuário do Instagram para obter análises detalhadas e insights
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
                        <Card className="text-center py-12 bg-white/90 backdrop-blur-sm">
                          <CardContent className="space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                              <Zap className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Comece sua Análise
                              </h3>
                              <p className="text-gray-600 max-w-md mx-auto">
                                Digite um nome de usuário do Instagram na barra de pesquisa acima para analisar perfis, posts e métricas de engajamento.
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
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Histórico de Pesquisas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchHistory.length > 0 ? (
                      <div className="space-y-3">
                        {searchHistory.slice(0, 3).map((entry) => (
                          <div 
                            key={entry.id} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleHistoryClick(entry)}
                          >
                            <div>
                              <p className="font-medium text-sm">@{entry.username}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              entry.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                          </div>
                        ))}
                        {searchHistory.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{searchHistory.length - 3} mais pesquisas
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-gray-400 text-xl">⌕</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Nenhum histórico ainda</p>
                        <p className="text-xs text-gray-500">
                          Pesquise por perfis do Instagram para vê-los aqui
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Premium Features */}
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Recursos Premium</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        'Análise avançada de sentimentos',
                        'Comparação de concorrentes',
                        'Rastreamento de performance de posts',
                        'Insights de audiência',
                        'Efetividade de hashtags'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.location.href = '/upgrade'}
                    >
                      Upgrade para Premium
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Full Search History Section */}
            {searchHistory.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico Completo de Pesquisas</h2>
                <SearchHistory
                  entries={searchHistory}
                  filters={historyFilters}
                  onFiltersChange={handleHistoryFiltersChange}
                  totalPages={totalHistoryPages}
                  onEntryClick={handleHistoryClick}
                  onClearHistory={handleClearHistory}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
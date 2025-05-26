import React, { useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import HistoryList from '../components/HistoryList';
import AnalyticsCard from '../components/AnalyticsCard';
import AnalyticsCardSkeleton from '../components/AnalyticsCardSkeleton';
import PostsList from '../components/PostsList';
import { useAnalyticsStore } from '../store/analytics';
import { useAuthStore } from '../store/auth';

const Dashboard: React.FC = () => {
  const { 
    currentProfile, 
    posts, 
    analysisResults, 
    fetchSearchHistory, 
    loading,
    clearCurrentProfile
  } = useAnalyticsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSearchHistory();
    
    // Clear current profile when unmounting
    return () => {
      clearCurrentProfile();
    };
  }, [fetchSearchHistory, clearCurrentProfile]);

  // Prepare chart data for comment distribution
  const commentLengthData = analysisResults ? {
    labels: ['Short (0-50 chars)', 'Medium (51-200 chars)', 'Long (201+ chars)'],
    datasets: [
      {
        label: 'Comment Length Distribution',
        data: [
          analysisResults.commentLengthDistribution.short,
          analysisResults.commentLengthDistribution.medium,
          analysisResults.commentLengthDistribution.long,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(139, 92, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  // Prepare chart data for top commenters
  const topAuthorsData = analysisResults ? {
    labels: analysisResults.topAuthors.map((author: any) => author.author),
    datasets: [
      {
        label: 'Number of Comments',
        data: analysisResults.topAuthors.map((author: any) => author.count),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user?.user_metadata?.name ? `Welcome, ${user.user_metadata.name}!` : 'Welcome!'}
          </h1>
          <p className="text-gray-600">
            Enter an Instagram username to get detailed analytics and insights
          </p>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {currentProfile ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Profile Analytics: @{currentProfile.instagram_username}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                      <>
                        <AnalyticsCardSkeleton />
                        <AnalyticsCardSkeleton />
                      </>
                    ) : (
                      <>
                        {commentLengthData && (
                          <AnalyticsCard
                            title="Comment Length Distribution"
                            data={commentLengthData}
                            type="doughnut"
                          />
                        )}
                        {topAuthorsData && topAuthorsData.labels.length > 0 && (
                          <AnalyticsCard
                            title="Top Commenters"
                            data={topAuthorsData}
                            type="bar"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>

                {posts && posts.length > 0 && (
                  <PostsList posts={posts} />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center h-64">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Start Your Analysis</h3>
                <p className="text-gray-600 max-w-md">
                  Enter an Instagram username in the search bar above to analyze profiles, posts, and engagement metrics.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <HistoryList />
            
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Features</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Advanced sentiment analysis</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Competitor comparison</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Post performance tracking</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Audience insights</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Hashtag effectiveness</span>
                </li>
              </ul>
              <div className="mt-4">
                <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
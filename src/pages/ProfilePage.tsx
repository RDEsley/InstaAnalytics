import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Instagram } from 'lucide-react';
import { format } from 'date-fns';
import Header from '../components/Header';
import AnalyticsCard from '../components/AnalyticsCard';
import AnalyticsCardSkeleton from '../components/AnalyticsCardSkeleton';
import PostsList from '../components/PostsList';
import { useAnalyticsStore } from '../store/analytics';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentProfile, 
    posts, 
    analysisResults,
    fetchProfileData, 
    loading 
  } = useAnalyticsStore();

  useEffect(() => {
    if (id) {
      fetchProfileData(id);
    }
  }, [id, fetchProfileData]);

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

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Dashboard</span>
        </button>

        {loading && !currentProfile ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        ) : !currentProfile ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Profile not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h1 className="text-2xl font-bold text-white">
                  @{currentProfile.instagram_username}
                </h1>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6">
                  <div className="flex items-center mr-6 mb-2">
                    <User className="h-4 w-4 mr-1" />
                    <span>Instagram Profile</span>
                  </div>
                  <div className="flex items-center mr-6 mb-2">
                    <Instagram className="h-4 w-4 mr-1" />
                    <a
                      href={`https://instagram.com/${currentProfile.instagram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View on Instagram
                    </a>
                  </div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      Analyzed on {format(new Date(currentProfile.search_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Posts Analyzed</p>
                    <p className="text-2xl font-bold text-gray-900">{posts?.length || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Total Comments</p>
                    <p className="text-2xl font-bold text-gray-900">{analysisResults?.totalComments || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Avg. Likes per Comment</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisResults?.averageLikes ? analysisResults.averageLikes.toFixed(1) : 0}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          height={250}
                        />
                      )}
                      {topAuthorsData && topAuthorsData.labels.length > 0 && (
                        <AnalyticsCard
                          title="Top Commenters"
                          data={topAuthorsData}
                          type="bar"
                          height={250}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {posts && posts.length > 0 && (
              <PostsList posts={posts} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
import React from 'react';
import { ExternalLink, MessageCircle, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface PostsListProps {
  posts: any[];
}

const PostsList: React.FC<PostsListProps> = ({ posts }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.slice(0, 9).map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {post.post_date && format(new Date(post.post_date), 'MMM d, yyyy')}
                </p>
                <p className="text-gray-800 line-clamp-3 mb-3">
                  {post.caption || 'No caption'}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1 text-red-500" />
                    <span>{post.likes_count}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
                    <span>{post.comments_count}</span>
                  </div>
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span>View</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {posts.length > 9 && (
        <div className="text-center mt-4">
          <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800">
            View More Posts
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsList;
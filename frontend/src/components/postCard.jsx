import { useAuth } from '../context/AuthContext';
import { Heart, Trash2, MessageCircle } from 'lucide-react';

const PostCard = ({ post, onLike, onDelete }) => {
  const { user } = useAuth();

  const isLiked = post.likes.includes(user?._id);
  const isOwner = post.user?._id === user?._id;

  const fullName = [
    post.user?.firstName,
    post.user?.middleName,
    post.user?.lastName
  ]
    .filter(Boolean)
    .join(' ');

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-md border border-gray-800">

      {/* User info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {post.user?.firstName?.[0]}{post.user?.lastName?.[0]}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{fullName}</p>
            <p className="text-gray-400 text-xs">{post.user?.role}</p>
          </div>
        </div>
        <span className="text-gray-500 text-xs">{formatDate(post.createdAt)}</span>
      </div>

      {/* Post text */}
      <p className="text-gray-200 text-sm leading-relaxed mb-4">{post.text}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-800">

        {/* Like button */}
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <Heart
            size={16}
            className={isLiked ? 'fill-red-400' : ''}
          />
          <span>{post.likes.length}</span>
        </button>

        {/* Comment count */}
        <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors">
          <MessageCircle size={16} />
          <span>{post.comments.length}</span>
        </button>

        {/* Delete (only owner) */}
        {isOwner && (
          <button
            onClick={() => onDelete(post._id)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors ml-auto"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
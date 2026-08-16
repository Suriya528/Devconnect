import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Trash2, MessageCircle, Send, X, ExternalLink, GitBranch, Sparkles } from 'lucide-react';

const PostCard = ({ post, onLike, onDelete, onAddComment, onDeleteComment, onAiReview }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const postUser = post.name || post.user || {};
  const postUserName = postUser.name || {};
  const postUserId = postUser._id || postUser.id;
  const isLiked = post.likes?.some((id) => id.toString() === user?._id?.toString());
  const isOwner = postUserId?.toString() === user?._id?.toString();

  const fullName = [
    postUserName.firstName || postUser.firstName,
    postUserName.middleName || postUser.middleName,
    postUserName.lastName || postUser.lastName
  ]
    .filter(Boolean)
    .join(' ');

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const imageGridClass = post.mediaUrls?.length === 1
    ? 'grid-cols-1'
    : post.mediaUrls?.length === 2
      ? 'grid-cols-2'
      : 'grid-cols-2';

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !onAddComment) return;
    setCommentLoading(true);
    const success = await onAddComment(post._id, commentText.trim());
    if (success) {
      setCommentText('');
    }
    setCommentLoading(false);
  };

  return (
    <article aria-label={"Post by " + (fullName || 'Unknown User')} className="bg-gray-900 rounded-2xl p-6 shadow-md border border-gray-800">
      {/* User info */}
      <div className="flex items-center justify-between mb-4">
        <div
          role="link"
          tabIndex={0}
          aria-label={"View profile of " + (fullName || 'Unknown User')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); postUserId && navigate('/developers/' + postUserId); } }}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => postUserId && navigate(`/developers/${postUserId}`)}
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {(postUserName.firstName || postUser.firstName)?.[0]}{(postUserName.lastName || postUser.lastName)?.[0]}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{fullName || 'Unknown User'}</p>
            <p className="text-gray-400 text-xs">{postUser.role}</p>
          </div>
        </div>
        <span className="text-gray-500 text-xs">{formatDate(post.createdAt)}</span>
      </div>

      {/* Post text */}
      {post.text && (
        <p className="text-gray-200 text-sm leading-relaxed mb-4">{post.text}</p>
      )}

      {/* Media */}
      {post.mediaUrls?.length > 0 && (
        <div className={`grid ${imageGridClass} gap-2 mb-4`}>
          {post.mediaUrls.map((media, index) => (
            <div key={index} className="rounded-lg overflow-hidden bg-gray-800">
              {media.type === 'video' ? (
                <video
                  src={media.url}
                  controls
                  className="w-full max-h-80 object-contain"
                />
              ) : (
                <img
                  src={media.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tech Stack */}
      {post.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.techStack.map((tech, i) => (
            <span
              key={i}
              className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      {(post.githubLink || post.demoLink) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {post.githubLink && (
            <a
              href={post.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <GitBranch size={16} />
              GitHub
            </a>
          )}
          {post.demoLink && (
            <a
              href={post.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
        <button
          onClick={() => onLike?.(post._id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
          }`}
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
        >
          <Heart
            size={16}
            className={isLiked ? 'fill-red-400' : ''}
          />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors"
          aria-label="Toggle comments"
        >
          <MessageCircle size={16} />
          <span>{post.comments?.length || 0}</span>
        </button>

        {isOwner && (
          <button
            onClick={() => onDelete?.(post._id)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
            aria-label="Delete post"
          >
            <Trash2 size={16} />
          </button>
        )}

        {onAiReview && (
          <button
            onClick={async () => {
              setReviewLoading(true);
              await onAiReview(post._id);
              setReviewLoading(false);
              setShowComments(true);
            }}
            disabled={reviewLoading}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-400 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="AI Code Review"
          >
            <Sparkles size={16} className={reviewLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{reviewLoading ? 'Reviewing...' : 'AI Review'}</span>
          </button>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          {post.comments?.length > 0 ? (
            <div role="list" aria-label="Comments" className="flex flex-col gap-3 mb-4">
              {post.comments.map((comment) => {
                const commentUser = comment.name || {};
                const commentUserName = commentUser.name || {};
                const commentName = [
                  commentUserName.firstName || commentUser.firstName,
                  commentUserName.middleName || commentUser.middleName,
                  commentUserName.lastName || commentUser.lastName
                ].filter(Boolean).join(' ') || 'Unknown User';
                const isCommentOwner = (commentUser._id || commentUser.id)?.toString() === user?._id?.toString();
                const isAi = comment.isAiReview;

                return (
                  <div key={comment._id} role="listitem" className={`flex items-start gap-2 ${isAi ? 'bg-purple-950/20 -mx-1 px-1 py-1.5 rounded-lg border border-purple-900/30' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isAi ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'bg-gray-700'}`}>
                      {isAi ? '🤖' : <>{(commentUserName.firstName || commentUser.firstName)?.[0]}{(commentUserName.lastName || commentUser.lastName)?.[0]}</>}
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold ${isAi ? 'text-purple-400' : 'text-white'}`}>
                          {isAi ? 'AI Code Review' : commentName}
                          {isAi && <span className="ml-1.5 px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded text-[10px] font-medium">BOT</span>}
                        </p>
                        {isCommentOwner && onDeleteComment && !isAi && (
                          <button
                            onClick={() => onDeleteComment(post._id, comment._id)}
                            className="text-gray-500 hover:text-red-400 transition-colors ml-2"
                            aria-label="Delete comment"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 whitespace-pre-line ${isAi ? 'text-gray-300 leading-relaxed' : 'text-gray-300'}`}>{comment.text?.replace(/^🤖 AI Code Review:\n?/, '')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-xs mb-4">No comments yet</p>
          )}

          {onAddComment && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                aria-label="Write a comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                placeholder="Write a comment..."
                maxLength={300}
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={commentLoading || !commentText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                aria-label="Send comment"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Trash2, MessageCircle, Send, X, ExternalLink, GitBranch, Sparkles } from 'lucide-react';

const PostCard = ({ post, onLike, onDelete, onAddComment, onDeleteComment, onAiReview }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
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

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={"Post by " + (fullName || 'Unknown User')}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.25)] animate-fade-in-up bg-[#0b1120] border border-white/5"
    >
      {/* Mouse Tracking Spotlight Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
        }}
      />
      
      {/* Card Content (Glassmorphic) */}
      <div className="relative z-10 bg-white/5 backdrop-blur-md p-6 m-[1px] rounded-2xl h-full flex flex-col">
        {/* User info */}
        <div className="flex items-center justify-between mb-5">
          <div
            role="link"
            tabIndex={0}
            aria-label={"View profile of " + (fullName || 'Unknown User')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); postUserId && navigate('/developers/' + postUserId); } }}
            className="flex items-center gap-4 cursor-pointer group/user"
            onClick={() => postUserId && navigate(`/developers/${postUserId}`)}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover/user:shadow-indigo-500/50 transition-all group-hover/user:scale-105 border-2 border-white/10 group-hover/user:border-white/20">
              {(postUserName.firstName || postUser.firstName)?.[0]}{(postUserName.lastName || postUser.lastName)?.[0]}
            </div>
            <div>
              <p className="text-white font-bold text-base group-hover/user:text-transparent group-hover/user:bg-clip-text group-hover/user:bg-gradient-to-r group-hover/user:from-indigo-300 group-hover/user:to-purple-300 transition-all">{fullName || 'Unknown User'}</p>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{postUser.role}</p>
            </div>
          </div>
          <span className="text-gray-500 text-xs font-medium">{formatDate(post.createdAt)}</span>
        </div>

        {/* Post text */}
        {post.text && (
          <p className="text-gray-200 text-base leading-relaxed mb-5 relative z-10">{post.text}</p>
        )}

        {/* Media */}
        {post.mediaUrls?.length > 0 && (
          <div className={`grid ${imageGridClass} gap-3 mb-5 relative z-10`}>
            {post.mediaUrls.map((media, index) => (
              <div key={index} className="rounded-xl overflow-hidden bg-black/40 border border-white/10 relative group/media">
                {media.type === 'video' ? (
                  <video
                    src={media.url}
                    controls
                    className="w-full max-h-96 object-contain"
                  />
                ) : (
                  <img
                    src={media.url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover/media:scale-105"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tech Stack */}
        {post.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 relative z-10">
            {post.techStack.map((tech, i) => (
              <span
                key={i}
                className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {(post.githubLink || post.demoLink) && (
          <div className="flex flex-wrap gap-4 mb-5 relative z-10">
            {post.githubLink && (
              <a
                href={post.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-medium transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5"
              >
                <GitBranch size={16} className="text-indigo-400" />
                Repository
              </a>
            )}
            {post.demoLink && (
              <a
                href={post.demoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-medium transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5"
              >
                <ExternalLink size={16} className="text-pink-400" />
                Live Demo
              </a>
            )}
          </div>
        )}

        {/* Actions (pushed to bottom if content varies) */}
        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onLike?.(post._id)}
              className={`group/btn flex items-center gap-2 text-sm font-medium transition-colors ${
                isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'
              }`}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-transparent group-hover/btn:bg-white/5'}`}>
                <Heart size={18} className={`${isLiked ? 'fill-pink-500' : ''} transition-transform group-hover/btn:scale-110`} />
              </div>
              <span>{post.likes?.length || 0}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="group/btn flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-indigo-400 transition-colors"
              aria-label="Toggle comments"
            >
              <div className="p-2 rounded-full bg-transparent group-hover/btn:bg-white/5 transition-colors">
                <MessageCircle size={18} className="transition-transform group-hover/btn:scale-110" />
              </div>
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onAiReview && (
              <button
                onClick={async () => {
                  setReviewLoading(true);
                  await onAiReview(post._id);
                  setReviewLoading(false);
                  setShowComments(true);
                }}
                disabled={reviewLoading}
                className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/20"
                aria-label="AI Code Review"
              >
                <Sparkles size={16} className={reviewLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{reviewLoading ? 'Reviewing...' : 'AI Review'}</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => onDelete?.(post._id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                aria-label="Delete post"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-5 pt-5 border-t border-white/10 animate-fade-in-up relative z-10">
            {post.comments?.length > 0 ? (
              <div role="list" aria-label="Comments" className="flex flex-col gap-4 mb-5">
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
                    <div key={comment._id} role="listitem" className={`flex items-start gap-3 ${isAi ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-3 -mx-3 rounded-xl border border-indigo-500/20 shadow-inner' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md ${isAi ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' : 'bg-white/10'}`}>
                        {isAi ? '🤖' : <>{(commentUserName.firstName || commentUser.firstName)?.[0]}{(commentUserName.lastName || commentUser.lastName)?.[0]}</>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-semibold ${isAi ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400' : 'text-gray-200'}`}>
                            {isAi ? 'AI Reviewer' : commentName}
                            {isAi && <span className="ml-2 px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.2)]">AI Bot</span>}
                          </p>
                          {isCommentOwner && onDeleteComment && !isAi && (
                            <button
                              onClick={() => onDeleteComment(post._id, comment._id)}
                              className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                              aria-label="Delete comment"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <p className={`text-sm whitespace-pre-line ${isAi ? 'text-gray-300 leading-relaxed font-mono text-xs p-3 bg-black/40 rounded-lg border border-white/5 mt-2' : 'text-gray-400'}`}>
                          {comment.text?.replace(/^🤖 AI Code Review:\n?/, '')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm font-medium mb-5 text-center py-4 bg-black/20 rounded-xl border border-white/5">Be the first to share your thoughts.</p>
            )}

            {onAddComment && (
              <div className="flex items-center gap-3 relative">
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
                  placeholder="Add a comment..."
                  maxLength={300}
                  className="flex-1 bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-600 text-sm shadow-inner"
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={commentLoading || !commentText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white p-3 rounded-xl transition-all disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:shadow-none flex-shrink-0"
                  aria-label="Send comment"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;

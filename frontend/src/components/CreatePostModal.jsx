import { useState, useRef, useEffect } from 'react';
import { X, Image, Video, ChevronDown, ChevronUp, Plus, Upload, Loader2, Sparkles } from 'lucide-react';
import useCreatePost from '../hooks/useCreatePost';

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const {
    text,
    setText,
    techStack,
    techInput,
    setTechInput,
    addTech,
    removeTech,
    githubLink,
    setGithubLink,
    demoLink,
    setDemoLink,
    images,
    handleImageChange,
    removeImage,
    video,
    handleVideoChange,
    removeVideo,
    uploading,
    posting,
    uploadProgress,
    handleSubmit
  } = useCreatePost();

  const [showDetails, setShowDetails] = useState(false);
  const [mediaType, setMediaType] = useState('image');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const onSubmit = async () => {
    await handleSubmit(onPostCreated);
    onClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const event = { target: { files } };
      handleImageChange(event);
    }
  };

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTech();
    }
  };

  const imageGridClass = images.length === 1
    ? 'grid-cols-1'
    : images.length === 2
      ? 'grid-cols-2'
      : 'grid-cols-2';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="create-post-title" onClick={onClose}>
      <div className="bg-[#0b1120]/95 backdrop-blur-xl rounded-3xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 blur-sm pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 relative z-10 bg-[#06090F]/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Sparkles size={18} />
            </div>
            <h2 id="create-post-title" className="text-white font-bold text-xl tracking-tight">Create Post</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Text Area */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind? Share your latest project, idea, or challenge..."
              rows={4}
              maxLength={500}
              aria-label="Post content"
              className="w-full bg-black/40 text-white px-5 py-4 rounded-2xl border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-500 resize-none text-base mb-2 shadow-inner"
            />
            <div className="absolute bottom-4 right-4 flex justify-end">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${text.length > 450 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'}`}>
                {text.length}/500
              </span>
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="mb-6 mt-4">
            {/* Toggle */}
            <div className="flex gap-2 mb-4 bg-black/40 p-1.5 rounded-xl border border-white/5 w-fit">
              <button
                onClick={() => setMediaType('image')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  mediaType === 'image'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Image size={16} className={mediaType === 'image' ? 'text-indigo-400' : ''} />
                Images
              </button>
              <button
                onClick={() => setMediaType('video')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  mediaType === 'video'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Video size={16} className={mediaType === 'video' ? 'text-purple-400' : ''} />
                Video
              </button>
            </div>

            {/* Image Upload */}
            {mediaType === 'image' && (
              <div>
                {images.length === 0 ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload images. Drag and drop or click to browse."
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="text-indigo-400" size={28} />
                    </div>
                    <p className="text-white font-bold text-base mb-1">Drag & drop images here</p>
                    <p className="text-gray-500 text-xs font-medium">Max 4 images, 10MB each (JPG, PNG, GIF)</p>
                  </div>
                ) : (
                  <div className={`grid ${imageGridClass} gap-3 mb-3`}>
                    {images.map((img, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 group">
                        <img
                          src={img.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-3 right-3 bg-black/60 backdrop-blur-md hover:bg-red-500 hover:text-white text-gray-300 rounded-full p-1.5 transition-colors shadow-lg"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length > 0 && images.length < 4 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold transition-colors flex items-center gap-1 bg-indigo-500/10 px-4 py-2 rounded-lg"
                  >
                    <Plus size={16} /> Add another image
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Video Upload */}
            {mediaType === 'video' && (
              <div>
                {!video ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload video. Click to browse."
                    onClick={() => videoInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        videoInputRef.current?.click();
                      }
                    }}
                    className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all"
                  >
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="text-purple-400" size={28} />
                    </div>
                    <p className="text-white font-bold text-base mb-1">Click to upload a video</p>
                    <p className="text-gray-500 text-xs font-medium">Max 100MB (MP4, MOV, WEBM)</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
                    <video
                      src={video.preview}
                      controls
                      className="w-full max-h-72 object-contain"
                    />
                    <button
                      onClick={removeVideo}
                      className="absolute top-3 right-3 bg-black/60 backdrop-blur-md hover:bg-red-500 text-gray-300 hover:text-white rounded-full p-2 transition-colors shadow-lg"
                      aria-label="Remove video"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Upload Progress */}
            {(uploading || posting) && uploadProgress > 0 && (
              <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-white">{posting ? 'Publishing...' : 'Uploading...'}</span>
                  <span className="text-sm font-bold text-indigo-400">{uploadProgress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                  className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-white/5"
                >
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1s_infinite] bg-[length:200%_auto]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="mb-6 bg-black/20 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
            <button
              onClick={() => setShowDetails((prev) => !prev)}
              aria-expanded={showDetails}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                  <Sparkles size={16} />
                </div>
                <span className="text-white text-sm font-bold">Add Project Metadata</span>
              </div>
              <div className={`p-1.5 rounded-full transition-colors ${showDetails ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-400'}`}>
                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {showDetails && (
              <div className="p-5 pt-0 space-y-4 animate-fade-in-up">
                <div className="h-px bg-white/5 w-full mb-4"></div>
                
                {/* Tech Stack */}
                <div>
                  <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-2 block">Tech Stack</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={handleTechKeyDown}
                      placeholder="e.g. React, Node.js"
                      className="flex-1 bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-gray-600 text-sm"
                    />
                    <button
                      onClick={addTech}
                      className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors border border-white/5"
                      aria-label="Add tech"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                      {techStack.map((tech) => (
                        <span
                          key={tech}
                          className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
                        >
                          {tech}
                          <button
                            onClick={() => removeTech(tech)}
                            className="text-indigo-400 hover:text-white hover:bg-indigo-500/50 rounded-full p-0.5 transition-colors"
                            aria-label={`Remove ${tech}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* GitHub Link */}
                  <div>
                    <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-2 block">Repository Link</label>
                    <input
                      type="url"
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-gray-600 text-sm"
                    />
                  </div>

                  {/* Demo Link */}
                  <div>
                    <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-2 block">Live Demo Link</label>
                    <input
                      type="url"
                      value={demoLink}
                      onChange={(e) => setDemoLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-gray-600 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={posting || !text.trim()}
            className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white py-4 rounded-2xl font-extrabold text-lg transition-all shadow-lg hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] disabled:shadow-none flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {posting ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                <span>Publishing to Feed...</span>
              </>
            ) : (
              <>
                <span>Publish Post</span>
                <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;

import { useState, useRef, useEffect } from 'react';
import { X, Image, Video, ChevronDown, ChevronUp, Plus, Upload, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="create-post-title" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 id="create-post-title" className="text-white font-bold text-lg">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Text Area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your work, project, or thoughts..."
            rows={4}
            maxLength={500}
            aria-label="Post content"
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none text-sm mb-2"
          />
          <div className="flex justify-end mb-4">
            <span className={`text-xs ${text.length > 450 ? 'text-red-400' : 'text-gray-500'}`}>
              {text.length}/500
            </span>
          </div>

          {/* Media Upload Section */}
          <div className="mb-4">
            {/* Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setMediaType('image')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mediaType === 'image'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Image size={16} />
                Images
              </button>
              <button
                onClick={() => setMediaType('video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mediaType === 'video'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Video size={16} />
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
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-400 text-sm mb-1">Drag & drop images here, or click to browse</p>
                    <p className="text-gray-500 text-xs">Max 4 images, 10MB each (JPG, PNG, GIF)</p>
                  </div>
                ) : (
                  <div className={`grid ${imageGridClass} gap-2 mb-2`}>
                    {images.map((img, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden bg-gray-800">
                        <img
                          src={img.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 4 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    + Add more images
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
                    className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-gray-600 transition-colors"
                  >
                    <Video className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-400 text-sm mb-1">Click to upload a video</p>
                    <p className="text-gray-500 text-xs">Max 100MB (MP4, MOV, WEBM)</p>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden bg-gray-800">
                    <video
                      src={video.preview}
                      controls
                      className="w-full max-h-64 object-contain"
                    />
                    <button
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                      aria-label="Remove video"
                    >
                      <X size={16} />
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
              <div className="mt-3">
                <div
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                  className="w-full bg-gray-800 rounded-full h-2 overflow-hidden"
                >
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1 text-center">
                  {posting ? 'Posting...' : 'Uploading...'} {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="mb-4 border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowDetails((prev) => !prev)}
              aria-expanded={showDetails}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-800 transition-colors"
            >
              <span className="text-white text-sm font-medium">Project Details</span>
              {showDetails ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </button>

            {showDetails && (
              <div className="p-3 pt-0 space-y-3">
                {/* Tech Stack */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Tech Stack</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={handleTechKeyDown}
                      placeholder="Add tech (press Enter)"
                      className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
                    />
                    <button
                      onClick={addTech}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                      aria-label="Add tech"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech) => (
                        <span
                          key={tech}
                          className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                        >
                          {tech}
                          <button
                            onClick={() => removeTech(tech)}
                            className="hover:text-white transition-colors"
                            aria-label={`Remove ${tech}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* GitHub Link */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">GitHub Link</label>
                  <input
                    type="url"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
                  />
                </div>

                {/* Demo Link */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Live Demo Link</label>
                  <input
                    type="url"
                    value={demoLink}
                    onChange={(e) => setDemoLink(e.target.value)}
                    placeholder="https://your-demo.vercel.app"
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={posting || !text.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {posting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Posting...
              </>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;

import { useState, useCallback } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const useCreatePost = () => {
  const [text, setText] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addTech = useCallback(() => {
    const trimmed = techInput.trim();
    if (!trimmed) return;
    if (techStack.includes(trimmed)) {
      toast.error('Tech already added');
      return;
    }
    if (techStack.length >= 5) {
      toast.error('Max 5 tech stacks allowed');
      return;
    }
    setTechStack((prev) => [...prev, trimmed]);
    setTechInput('');
  }, [techInput, techStack]);

  const removeTech = useCallback((tech) => {
    setTechStack((prev) => prev.filter((t) => t !== tech));
  }, []);

  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      toast.error('Max 4 images allowed');
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, [images.length]);

  const removeImage = useCallback((index) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return next;
    });
  }, []);

  const handleVideoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (video) {
      URL.revokeObjectURL(video.preview);
    }
    setVideo({
      file,
      preview: URL.createObjectURL(file)
    });
  }, [video]);

  const removeVideo = useCallback(() => {
    if (video) {
      URL.revokeObjectURL(video.preview);
    }
    setVideo(null);
  }, [video]);

  const handleSubmit = useCallback(async (onSuccess) => {
    if (!text.trim()) return toast.error('Post text is required');
    if (text.length > 500) return toast.error('Max 500 characters');
    if (images.length === 0 && !video && techStack.length === 0) {
      return toast.error('Add some content to your post');
    }

    try {
      setPosting(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('text', text.trim());
      formData.append('techStack', JSON.stringify(techStack));
      if (githubLink) formData.append('githubLink', githubLink);
      if (demoLink) formData.append('demoLink', demoLink);

      if (video) {
        formData.append('video', video.file);
        await axios.post('/api/posts/video', formData, {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        });
      } else if (images.length > 0) {
        images.forEach((img) => {
          formData.append('images', img.file);
        });
        await axios.post('/api/posts', formData, {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        });
      } else {
        const { data } = await axios.post('/api/posts', formData);
        if (onSuccess) onSuccess(data);
        reset();
        return;
      }

      toast.success('Post created! 🚀');
      if (onSuccess) onSuccess();
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setPosting(false);
      setUploadProgress(0);
    }
  }, [text, techStack, githubLink, demoLink, images, video]);

  const reset = useCallback(() => {
    setText('');
    setTechStack([]);
    setTechInput('');
    setGithubLink('');
    setDemoLink('');
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
    setVideo(null);
  }, []);

  return {
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
    handleSubmit,
    reset
  };
};

export default useCreatePost;

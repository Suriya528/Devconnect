const Avatar = ({ firstName, lastName, image, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  };

  return (
    <div
      role="img"
      aria-label={`${firstName || ''} ${lastName || ''}`}
      className={`rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {image ? (
        <img src={image} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        `${firstName?.[0] || ''}${lastName?.[0] || ''}`
      )}
    </div>
  );
};

export default Avatar;
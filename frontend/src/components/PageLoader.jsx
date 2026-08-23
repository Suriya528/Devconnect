import React from 'react';

const PageLoader = () => {
  return (
    <div 
      role="status"
      aria-label="Loading page content"
      className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4"
    >
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-purple-500 border-b-transparent animate-spin-slow opacity-70" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400/70 animate-pulse">
        Loading Experience...
      </p>
    </div>
  );
};

export default React.memo(PageLoader);

const PostSkeleton = () => {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-700" />
        <div className="flex flex-col gap-2">
          <div className="w-28 h-3 bg-gray-700 rounded" />
          <div className="w-20 h-2 bg-gray-800 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <div className="w-full h-3 bg-gray-700 rounded" />
        <div className="w-4/5 h-3 bg-gray-700 rounded" />
        <div className="w-3/5 h-3 bg-gray-700 rounded" />
      </div>
      <div className="flex gap-4 pt-3 border-t border-gray-800">
        <div className="w-10 h-3 bg-gray-700 rounded" />
        <div className="w-10 h-3 bg-gray-700 rounded" />
      </div>
    </div>
  );
};

export default PostSkeleton;
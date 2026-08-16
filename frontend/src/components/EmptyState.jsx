const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center text-gray-500 py-12">
      {Icon && <Icon size={40} className="mx-auto text-gray-600 mb-4" />}
      <p className="text-lg text-gray-400">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

const DeveloperCard = ({ developer }) => {
  const navigate = useNavigate();

  // Handle both flat and nested name structures
  const firstName = developer.firstName || developer.name?.firstName;
  const middleName = developer.middleName || developer.name?.middleName;
  const lastName = developer.lastName || developer.name?.lastName;

  const fullName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={"View profile of " + (fullName || 'Unknown User')}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/developers/' + developer._id); } }}
      onClick={() => navigate(`/developers/${developer._id}`)}
      className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-blue-600 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-4">

        {/* Avatar */}
        <Avatar firstName={firstName} lastName={lastName} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{fullName || 'Unknown User'}</p>
          <p className="text-blue-400 text-sm truncate">{developer.role}</p>
          {developer.location && (
            <p className="text-gray-500 text-xs truncate">{developer.location}</p>
          )}
        </div>

        {/* Arrow */}
        <span className="text-gray-600 text-lg">→</span>
      </div>
    </div>
  );
};

export default DeveloperCard;
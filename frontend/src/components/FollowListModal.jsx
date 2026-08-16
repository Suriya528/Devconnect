import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, UserMinus } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import Avatar from './Avatar';
import useFollow from '../hooks/useFollow';

const FollowListModal = ({ open, onClose, type, userId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !userId) return;

    const fetchList = async () => {
      try {
        setLoading(true);
        const endpoint = type === 'followers'
          ? `/api/user/${userId}/followers`
          : `/api/user/${userId}/following`;

        const { data } = await axios.get(endpoint);
        setItems(data);
      } catch (err) {
        toast.error('Failed to load list');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [open, userId, type]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg capitalize">
            {type}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <div className="flex flex-col gap-3 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
                    <div className="w-16 h-3 bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No {type} yet
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((person) => {
                const firstName = person.name?.firstName || person.firstName;
                const lastName = person.name?.lastName || person.lastName;
                const fullName = [firstName, lastName].filter(Boolean).join(' ');

                return (
                  <FollowListItem key={person._id} person={person} onClose={onClose} />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FollowListItem = ({ person, onClose }) => {
  const navigate = useNavigate();
  const { following, loading: followLoading, toggleFollow } = useFollow(person._id);

  const firstName = person.name?.firstName || person.firstName;
  const lastName = person.name?.lastName || person.lastName;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const handleNavigate = () => {
    onClose?.();
    navigate(`/developers/${person._id}`);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-colors">
      <div
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        onClick={handleNavigate}
      >
        <Avatar firstName={firstName} lastName={lastName} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">
            {fullName || 'Unknown User'}
          </p>
          <p className="text-gray-400 text-xs truncate">{person.role}</p>
        </div>
      </div>
      <button
        onClick={() => toggleFollow()}
        disabled={followLoading}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          following
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {following ? (
          <>
            <UserMinus size={12} />
            Following
          </>
        ) : (
          <>
            <UserPlus size={12} />
            Follow
          </>
        )}
      </button>
    </div>
  );
};

export default FollowListModal;

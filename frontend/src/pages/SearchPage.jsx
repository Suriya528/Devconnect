import { Search, Loader2, UserX } from 'lucide-react';
import useSearch from '../hooks/useSearch';
import DeveloperCard from '../components/DeveloperCard';
import EmptyState from '../components/EmptyState';

const SearchPage = () => {
  const { query, setQuery, results, loading, error } = useSearch();

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-white mb-6">
          Find Developers 🔍
        </h1>

        {/* Search input */}
        <div className="relative mb-6" role="search">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or role..."
            aria-label="Search developers by name or role"
            className="w-full bg-gray-900 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 border border-gray-800"
          />
          {loading && (
            <Loader2
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin"
            />
          )}
        </div>

        {/* Results */}
        {!query.trim() ? (
          <EmptyState
            icon={Search}
            title="Search for developers"
            description='Try searching by name or role (e.g. "React Developer")'
          />
        ) : loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-2xl p-5 border border-gray-800 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="w-32 h-3 bg-gray-700 rounded" />
                    <div className="w-24 h-2 bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg text-red-400">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="No developers found"
            description="Try a different search term"
          />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-gray-400 text-sm mb-2" aria-live="polite">
              {results.length} developer{results.length > 1 ? 's' : ''} found
            </p>
            {results.map((dev) => (
              <DeveloperCard key={dev._id} developer={dev} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchPage;
import { Star, GitFork, ExternalLink } from 'lucide-react';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516',
  PHP: '#4F5D95', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
  Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Vue: '#41b883',
  Svelte: '#ff3e00', null: '#8b949e'
};

const GitHubRepos = ({ repos, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800 animate-pulse">
            <div className="w-32 h-4 bg-gray-700 rounded mb-3" />
            <div className="w-full h-3 bg-gray-800 rounded mb-2" />
            <div className="w-3/4 h-3 bg-gray-800 rounded mb-3" />
            <div className="flex gap-3">
              <div className="w-16 h-3 bg-gray-800 rounded" />
              <div className="w-12 h-3 bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!repos?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {repos.map((repo) => (
        <a
          key={repo.name}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-blue-600 transition-all group block"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-500 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9z" />
            </svg>
            <span className="text-blue-400 font-semibold text-sm truncate group-hover:underline">
              {repo.name}
            </span>
            <ExternalLink size={12} className="text-gray-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {repo.description && (
            <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
              {repo.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: LANG_COLORS[repo.language] || LANG_COLORS[null] }}
                />
                {repo.language}
              </span>
            )}
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} />
                {repo.stargazers_count}
              </span>
            )}
            {repo.forks_count > 0 && (
              <span className="flex items-center gap-1">
                <GitFork size={12} />
                {repo.forks_count}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
};

export default GitHubRepos;

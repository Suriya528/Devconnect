const ProfileCompleteness = ({ profile }) => {
  if (!profile) return null;

  const checks = [
    { label: 'First & Last Name', done: Boolean(profile.firstName && profile.lastName) },
    { label: 'Role', done: Boolean(profile.role) },
    { label: 'Bio', done: Boolean(profile.bio) },
    { label: 'Skills', done: Boolean(profile.skills?.length > 0) },
    { label: 'Location', done: Boolean(profile.location) },
    { label: 'GitHub or LinkedIn', done: Boolean(profile.github || profile.linkedin) }
  ];

  const completed = checks.filter((c) => c.done).length;
  const percentage = Math.round((completed / checks.length) * 100);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Profile Completeness</h3>
        <span className="text-blue-400 font-bold">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-sm">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                check.done ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {check.done ? '✓' : '•'}
            </span>
            <span className={check.done ? 'text-gray-300' : 'text-gray-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompleteness;
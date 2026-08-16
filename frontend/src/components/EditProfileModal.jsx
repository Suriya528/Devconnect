import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const EditProfileModal = ({ profile, onSave, onClose, updating }) => {
  const [skills, setSkills] = useState(
    profile?.skills?.map(s => typeof s === 'string' ? s : s.name) || []
  );
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    middleName: profile?.middleName || '',
    lastName: profile?.lastName || '',
    role: profile?.role || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    github: profile?.github || '',
    portfolio: profile?.portfolio || '',
    linkedin: profile?.linkedin || '',
    availability: profile?.availability || 'available',
    password: ''
  });

  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName) {
      return;
    }

    const payload = {
      ...formData,
      skills
    };

    if (!payload.password) delete payload.password;

    onSave(payload);
  };

  const inputClass = "w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClass = "text-gray-400 text-sm mb-1 block";

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 overflow-y-auto py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="edit-profile-title" className="text-white font-bold text-lg">Edit Profile</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Middle Name <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Full Stack Developer"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell developers about yourself..."
              rows={3}
              maxLength={200}
              className={`${inputClass} resize-none`}
            />
            <p className="text-gray-500 text-xs mt-1 text-right">
              {formData.bio.length}/200
            </p>
          </div>

          <div>
            <label className={labelClass}>Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Add a skill"
                className={`${inputClass} flex-1`}
              />
              <button
                onClick={addSkill}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:text-white transition-colors"
                      aria-label={`Remove ${skill}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Chennai, India"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>GitHub URL</label>
            <input
              type="url"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Portfolio URL</label>
            <input
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://yourportfolio.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Availability</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="available">Available</option>
              <option value="open-to-work">Open to Work</option>
              <option value="busy">Busy</option>
              <option value="not-available">Not Available</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              New Password <span className="text-gray-600">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              className={inputClass}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-700 text-gray-300 hover:border-gray-500 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;
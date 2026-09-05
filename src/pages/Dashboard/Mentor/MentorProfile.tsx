import React, { useState, useEffect } from 'react';
import { 
  User, Award, AlignLeft, ShieldAlert, 
  Loader2, Check, Image as ImageIcon, Briefcase 
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

export const MentorProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [expertiseTags, setExpertiseTags] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const mentor = await courseService.getMentorProfile();
        setName(mentor.name);
        setDesignation(mentor.designation);
        setBio(mentor.bio);
        setProfileImage(mentor.profileImage);
        setExpertiseTags(mentor.expertise.join(', '));
        setError(null);
      } catch (err) {
        setError('Failed to fetch your mentor profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designation || !bio) {
      setError('Please fill in name, designation, and biography details.');
      return;
    }

    const payload = {
      name,
      designation,
      bio,
      profileImage,
      expertise: expertiseTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    };

    try {
      setSaving(true);
      await courseService.updateMentorProfile(payload);
      setSuccess('Your profile details were updated successfully.');
      setError(null);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Verifying Profile Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-2xl">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-white">Mentor Biography</h2>
        <p className="text-xs text-stone-400 mt-1">Configure profile details visible to students across program landing pages.</p>
      </div>

      {success && (
        <div className="p-4 bg-green-950/20 border border-green-900/50 text-green-300 text-xs rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Details Card */}
      <form 
        onSubmit={handleSubmit}
        className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl space-y-5 text-xs text-stone-300"
      >
        {/* Profile Avatar Card Preview */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-950/40 p-4 rounded-xl border border-stone-850/50">
          <img
            src={profileImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=120'}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border border-stone-850 shadow"
          />
          <div className="text-center sm:text-left space-y-1">
            <h4 className="font-bold text-white text-sm leading-snug">{name || 'Your Profile Name'}</h4>
            <span className="text-[10px] text-stone-500 font-semibold">{designation || 'Your Designation'}</span>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Mentor Profile Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        {/* Designation */}
        <div className="space-y-1.5">
          <label className="font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            Designation / Professional Title
          </label>
          <input
            type="text"
            required
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        {/* Avatar Image URL */}
        <div className="space-y-1.5">
          <label className="font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            Avatar Image URL
          </label>
          <input
            type="text"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
          />
        </div>

        {/* Expertise comma separated tags */}
        <div className="space-y-1.5">
          <label className="font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            Areas of Expertise (Comma Separated)
          </label>
          <input
            type="text"
            value={expertiseTags}
            onChange={(e) => setExpertiseTags(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        {/* Biography text */}
        <div className="space-y-1.5">
          <label className="font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5" />
            Biography Details
          </label>
          <textarea
            rows={5}
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none resize-none"
          />
        </div>

        {/* Save button */}
        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-2.5 font-bold rounded-xl flex items-center justify-center gap-1.5 inline-flex"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Biography Changes
          </button>
        </div>
      </form>
    </div>
  );
};

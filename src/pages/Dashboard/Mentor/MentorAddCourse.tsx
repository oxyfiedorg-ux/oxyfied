import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldAlert, Loader2 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { courseService } from '../../../services/courseService';

interface CategoryOption {
  id: string;
  name: string;
}

export const MentorAddCourse: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('8 Weeks');
  const [level, setLevel] = useState('Beginner');
  const [skillsInput, setSkillsInput] = useState('');
  const [reqsInput, setReqsInput] = useState('');
  const [whoInput, setWhoInput] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setFetchingCategories(true);
        const data = await courseService.getAdminCategories();
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
        setError(null);
      } catch (err) {
        setError('Failed to fetch categories list.');
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCats();
  }, []);

  // Autofill slug from title
  useEffect(() => {
    setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !categoryId || !price) {
      setError('Please fill in title, slug, category, and price details.');
      return;
    }

    const payload = {
      title,
      slug,
      shortDescription: shortDesc,
      description,
      thumbnail,
      categoryId,
      price: parseFloat(price),
      duration,
      level,
      skills: skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      requirements: reqsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      whoIsItFor: whoInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };
    console.log('Creating mentor course with payload:', payload);
    try {
      setLoading(true);
      const response = await courseService.createMentorCourse(payload);
      console.log('Create mentor course response:', response);
      setError(null);
      // Redirect to courses catalogue and force reload to fetch latest data
      navigate('/mentor/dashboard/courses');
      // Small timeout to ensure navigation completes before reload
      setTimeout(() => {
        window.location.reload();
      }, 200);
    } catch (err) {
      console.error('Error creating mentor course:', err);
      setError('Failed to save program track. Verify slug is unique.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Loading Catalog configs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Back button & Title */}
      <div className="space-y-3">
        <Link 
          to="/mentor/dashboard/courses"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white">Create Technical Program Track</h2>
          <p className="text-xs text-stone-400 mt-1">Submit technical details to seed your program track. New tracks launch as drafts by default.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form 
        onSubmit={handleSubmit}
        className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl space-y-5 text-xs text-stone-300"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4.5">
          {/* Title */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Program Track Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exploitation & Advanced Buffer Overflows"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-400 uppercase tracking-widest">URL Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. exploitation-and-advanced-buffer-overflows"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Technical Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Duration</label>
            <input
              type="text"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 10 Weeks"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none"
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Price ($ USD)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 199"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none"
            />
          </div>

          {/* Difficulty Level */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Difficulty Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Thumbnail Image URL */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Thumbnail Image URL</label>
            <input
              type="text"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="Unsplash, cloud, or relative URL..."
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none"
            />
          </div>

          {/* Short description summary */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Short summary headline</label>
            <input
              type="text"
              required
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Explain course goals in one clear sentence..."
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none"
            />
          </div>

          {/* Full description */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Course Curriculum Details</label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fully outline course topics, assignments, and modules..."
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none resize-none"
            />
          </div>

          {/* Skills tags */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Skills Gained (Comma Separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Immunity Debugger, Stack overflows, SEH overwrite"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none"
            />
          </div>

          {/* Reqs tags */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Prerequisites (Comma Separated)</label>
            <input
              type="text"
              value={reqsInput}
              onChange={(e) => setReqsInput(e.target.value)}
              placeholder="e.g. Basic assembly concepts, Python script writing"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none"
            />
          </div>

          {/* Who is it for */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-stone-400 uppercase tracking-widest">Target Audience (Comma Separated)</label>
            <input
              type="text"
              value={whoInput}
              onChange={(e) => setWhoInput(e.target.value)}
              placeholder="e.g. Penetration testers, Exploit researchers"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-stone-850 flex justify-end gap-3">
          <Link 
            to="/mentor/dashboard/courses"
            className="btn-secondary px-5 py-2 font-bold rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 font-bold rounded-xl flex items-center gap-1.5"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save & Create Course
          </button>
        </div>
      </form>
    </div>
  );
};

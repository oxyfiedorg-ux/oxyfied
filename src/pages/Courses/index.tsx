import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Clock, BookOpen, Star, RefreshCw, AlertCircle } from 'lucide-react';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types';
import { SEO } from '../../components/common/SEO';

export const Courses: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & Filter state parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Dynamic courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize URL search params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Fetch courses from Neon on mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setError('Database server is temporarily offline. Please check back later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSelectedPrice('all');
    setSortBy('popular');
    setSearchParams({});
  };

  // Filter & Sort core courses array
  const filteredCourses = courses.filter((course) => {
    // 1. Search filter
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Category filter
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'available' && course.status === 'available') ||
      (selectedCategory === 'coming-soon' && course.status === 'coming-soon') ||
      course.category.toLowerCase() === selectedCategory.toLowerCase();

    // 3. Level filter
    const matchesLevel =
      selectedLevel === 'all' ||
      course.level.toLowerCase().includes(selectedLevel.toLowerCase());

    // 4. Price filter
    let matchesPrice = true;
    if (selectedPrice === 'free') {
      matchesPrice = course.price === 0;
    } else if (selectedPrice === 'paid') {
      matchesPrice = course.price > 0;
    }

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  }).sort((a, b) => {
    // Sorting algorithms
    if (sortBy === 'popular') {
      return b.students - a.students;
    }
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <div className="bg-stone-955 min-h-screen py-12">
      <SEO 
        title="Explore Technology Programs" 
        description="Browse available tech training tracks at Oxyfied. Learn Cybersecurity, Data Science, and discover upcoming developer programs."
        canonical="/courses"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-display font-extrabold text-white">Explore Programs</h1>
          <p className="text-stone-400 text-xs sm:text-sm">
            Acquire specialized tech abilities through structured lessons, labs, and capstones.
          </p>
        </div>

        {/* Filters and List panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Filters (4 columns) */}
          <aside className="lg:col-span-3 bg-[#141210] border border-stone-850 p-6 rounded-2xl shadow-xl h-fit space-y-6">
            <div className="flex items-center justify-between border-b border-stone-850 pb-3">
              <h3 className="font-display font-bold text-sm text-white">Filters</h3>
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-amber-500 hover:text-amber-450 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Clear All
              </button>
            </div>

            {/* Filter: Search input */}
            <div className="space-y-2">
              <label htmlFor="course-search" className="text-[10px] font-bold text-stone-450 uppercase tracking-widest block">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="course-search"
                  placeholder="e.g. Python, Linux..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 text-xs text-white rounded-lg focus:outline-none focus:border-amber-500 transition-all placeholder-stone-600"
                />
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Filter: Category */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-stone-450 uppercase tracking-widest block text-left">
                Category
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'all', label: 'All Tracks' },
                  { value: 'Cybersecurity', label: 'Cybersecurity' },
                  { value: 'Data Science', label: 'Data Science' },
                  { value: 'available', label: 'Live Available' },
                  { value: 'coming-soon', label: 'Coming Soon' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedCategory(opt.value)}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all border flex justify-between items-center ${
                      selectedCategory === opt.value
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/50'
                        : 'bg-stone-955 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedCategory === opt.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Experience Level */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-stone-450 uppercase tracking-widest block text-left">
                Experience Level
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'All Levels' },
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedLevel(opt.value)}
                    className={`px-2 py-2 text-[10px] font-semibold rounded-lg text-center transition-all border ${
                      selectedLevel === opt.value
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/50'
                        : 'bg-stone-955 text-stone-350 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Pricing */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-stone-455 uppercase tracking-widest block text-left">
                Pricing
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: 'paid', label: 'Live Programs (Paid)' },
                  { value: 'free', label: 'Coming Soon (Placeholder)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedPrice(opt.value)}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all border flex justify-between items-center ${
                      selectedPrice === opt.value
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/50'
                        : 'bg-stone-955 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedPrice === opt.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-405 animate-pulse shadow-[0_0_8px_#fbbf24]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: Sort parameters */}
            <div className="space-y-2">
              <label htmlFor="sort-select" className="text-[10px] font-bold text-stone-455 uppercase tracking-widest block">
                Sort By
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-stone-955 border border-stone-800 text-xs text-stone-300 rounded-lg focus:outline-none focus:border-amber-500 focus:text-white transition-all"
              >
                <option value="popular">Most Enrolled (Popular)</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </aside>

          {/* Right panel: Course listing grids (9 columns) */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between text-xs text-stone-400 font-semibold border-b border-stone-850 pb-3 text-left">
              <span>Showing {filteredCourses.length} programs</span>
              {searchTerm && <span>Search: "{searchTerm}"</span>}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-stone-900 border border-stone-850 rounded-2xl p-5 space-y-4 animate-pulse">
                    <div className="aspect-[16/10] bg-stone-950/60 rounded-xl" />
                    <div className="h-4 bg-stone-950/60 rounded w-3/4" />
                    <div className="h-3 bg-stone-950/60 rounded w-1/2" />
                    <div className="h-6 bg-stone-950/60 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-stone-900 border border-stone-850 p-12 rounded-2xl shadow-xl text-center max-w-lg mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="font-display font-semibold text-white text-base">Error Loading Programs</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{error}</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-stone-900 border border-stone-850 p-12 rounded-2xl shadow-xl text-center max-w-lg mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-stone-500 mx-auto" />
                <h3 className="font-display font-semibold text-white text-base">No programs found</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Try adjusting your filters, clearing the search input, or selecting a broader category choice.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn-primary px-4 py-2 text-xs font-bold rounded-lg shadow"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const isComingSoon = course.status === 'coming-soon';
                  return (
                    <div
                      key={course.id}
                      className="bg-stone-900 border border-stone-850 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 transition-all duration-300 shadow-xl"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-stone-950 border-b border-stone-850/60">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-deep-navy-950/80 backdrop-blur text-white text-[10px] font-bold rounded uppercase tracking-wider border border-white/10">
                          {course.category}
                        </span>
                        {isComingSoon && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-955 border border-amber-850/30 text-amber-450 text-[10px] font-bold rounded uppercase tracking-wider">
                            Coming Soon
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-display font-bold text-sm text-white hover:text-amber-400 transition-colors leading-snug">
                            <Link to={isComingSoon ? '#' : `/courses/${course.slug}`}>{course.title}</Link>
                          </h3>
                          <p className="text-stone-400 text-[11px] leading-relaxed line-clamp-3">
                            {course.description}
                          </p>
                        </div>

                        {/* Skill badges */}
                        <div className="flex flex-wrap gap-1">
                          {course.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-2 py-0.5 bg-stone-950 text-stone-300 text-[9px] font-bold rounded">
                              {skill}
                            </span>
                          ))}
                        </div>

                        {!isComingSoon && (
                          <div className="flex items-center justify-between text-[10px] text-stone-450 font-semibold border-t border-stone-850 pt-3.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {course.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {course.lessons} lessons
                            </span>
                            <span className="flex items-center gap-1 text-amber-450">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {course.rating}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2.5 border-t border-stone-850">
                          {isComingSoon ? (
                            <span className="text-[11px] text-stone-500 font-bold uppercase py-1 px-2.5 bg-stone-950 border border-stone-850 rounded-lg w-full text-center">
                              Registration Coming Soon
                            </span>
                          ) : (
                            <>
                              <div className="flex flex-col">
                                <span className="text-stone-500 text-[9px] line-through font-semibold leading-none">
                                  ${course.originalPrice}
                                </span>
                                <span className="text-white font-display font-extrabold text-base leading-tight">
                                  ${course.price}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  to={`/courses/${course.slug}`}
                                  className="btn-secondary px-3 py-1.5 text-[10px] font-bold rounded-lg"
                                >
                                  Details
                                </Link>
                                <button
                                  onClick={() => {
                                    if (course.id) {
                                      navigate(`/checkout/${course.id}`);
                                    }
                                  }}
                                  className="btn-primary px-3 py-1.5 text-[10px] font-bold rounded-lg"
                                >
                                  Enroll
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  Star,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Layers
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import api from '../../services/api';
import type { Course, Testimonial, Instructor, StatItem } from '../../types';
import { blogPosts } from '../../data/blog';
import { useCart } from '../../context/CartContext';
import { SEO } from '../../components/common/SEO';

export const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Cybersecurity' | 'Data Science' | 'Coming Soon'>('All');
  const [notifiedEmails, setNotifiedEmails] = useState<Record<string, boolean>>({});
  const [emailInput, setEmailInput] = useState<Record<string, string>>({});
  
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  // Dynamic homepage states
  const [courses, setCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [statsData, setStatsData] = useState<StatItem[]>([]);
  const [hero, setHero] = useState({
    title: 'Learn the skills that make you useful.',
    subtitle: 'Practical technology education',
    description: 'Build confident, career-ready ability in cybersecurity and data science through focused lessons, hands-on labs, and projects worth showing.'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Homepage and Course records from Neon on mount
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setIsLoading(true);
        // Load courses
        const activeCourses = await courseService.getCourses();
        setCourses(activeCourses);

        // Load public instructors list
        const instructorList = await courseService.getInstructors();
        setInstructors(instructorList);

        // Load hero config, stats, testimonials
        const response = await api.get('/homepage');
        const { hero, stats, testimonials } = response.data;
        if (hero) setHero(hero);
        if (stats) setStatsData(stats);
        if (testimonials) setTestimonials(testimonials);
      } catch (err) {
        console.error('Failed to load homepage database elements:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  // Handle enrollment CTA
  const handleEnrollClick = (course: any) => {
    if (isInCart(course.id)) {
      navigate(`/checkout/${course.id}`);
    } else {
      addToCart({
        courseId: course.id,
        title: course.title,
        price: course.price,
        image: course.image,
        slug: course.slug
      });
      navigate(`/checkout/${course.id}`);
    }
  };

  // Handle upcoming course email notification signup
  const handleNotifySubmit = (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    const email = emailInput[courseId] || '';
    if (!email.trim()) return;
    
    setNotifiedEmails((prev) => ({ ...prev, [courseId]: true }));
    setEmailInput((prev) => ({ ...prev, [courseId]: '' }));
  };

  // Handle changing inputs
  const handleEmailChange = (courseId: string, val: string) => {
    setEmailInput((prev) => ({ ...prev, [courseId]: val }));
  };

  // Filter courses based on active categories
  const filteredCourses = courses.filter((course) => {
    if (activeCategory === 'All') return course.status === 'available';
    if (activeCategory === 'Cybersecurity') return course.category === 'Cybersecurity';
    if (activeCategory === 'Data Science') return course.category === 'Data Science';
    if (activeCategory === 'Coming Soon') return course.status === 'coming-soon';
    return true;
  });

  return (
    <div className="space-y-0">
      <SEO 
        title="Learn Technology. Build Your Future." 
        description="Learn in-demand technology skills through practical, industry-focused courses designed to help you build real-world knowledge and become career ready."
        canonical="/"
      />
      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden bg-deep-navy-950 text-white py-20 sm:py-28">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#f59e0b_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full border border-amber-400/20" />
        <div className="absolute -right-24 -top-24 h-[24rem] w-[24rem] rounded-full border border-amber-400/20" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-400">
              <span className="h-px w-10 bg-amber-400" />
              {hero.subtitle}
            </div>
            <h1 
              className="max-w-3xl font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-7xl"
              dangerouslySetInnerHTML={{ __html: hero.title }}
            />
            <p className="mt-7 max-w-xl text-base leading-relaxed text-stone-300 sm:text-lg">
              {hero.description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/courses" className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-sm font-bold">
                Start building <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center rounded-lg border border-stone-700 px-7 py-3.5 text-sm font-bold text-stone-200 transition-colors hover:border-amber-400 hover:text-amber-400">
                See how it works
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-stone-800 pt-5 text-xs font-semibold text-stone-400">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Project-led</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Expert guided</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Learn at your pace</span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative overflow-hidden border border-stone-700 bg-stone-950 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-stone-800 px-5 py-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Oxyfied / your progress</span>
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-400" /> Live</span>
              </div>
              <div className="space-y-7 p-6 sm:p-8">
                <div>
                  <div className="mb-3 flex items-end justify-between"><span className="font-display text-2xl font-bold">Build momentum.</span><span className="font-mono text-sm text-amber-400">01 / 04</span></div>
                  <div className="h-2 bg-stone-800"><div className="h-full w-1/4 bg-amber-400" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-stone-800 bg-stone-900 p-4"><ShieldCheck className="mb-5 h-5 w-5 text-amber-400" /><span className="block text-xs text-stone-500">Track one</span><strong className="mt-1 block text-sm">Cybersecurity</strong></div>
                  <div className="border border-stone-800 bg-stone-900 p-4"><TrendingUp className="mb-5 h-5 w-5 text-orange-400" /><span className="block text-xs text-stone-500">Track two</span><strong className="mt-1 block text-sm">Data science</strong></div>
                </div>
                <div className="border-l-2 border-amber-400 pl-4"><p className="font-mono text-xs leading-relaxed text-stone-400">&gt; learn by doing<br /><span className="text-amber-400">&gt; ship work you understand</span></p></div>
              </div>
            </motion.div>
            <div className="absolute -bottom-5 -left-5 hidden border border-amber-400/50 bg-amber-400 px-4 py-3 text-xs font-black uppercase tracking-widest text-stone-950 sm:block">Make it real.</div>
          </div>
        </div>
      </section>

      {/* 4. TRUST SECTION */}
      <section className="bg-stone-900 border-y border-stone-850 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            Master Skills That Matter in the Real World
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-16 text-stone-300 font-display font-medium text-sm sm:text-base">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              Practical Labs
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              Expert-Led Coursework
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              Project-Based Portfolios
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              Career-Focused Outcomes
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              Industry Certification
            </span>
          </div>
        </div>
      </section>

      {/* 5. EXPLORE PROGRAMS & FILTER SYSTEM */}
      <section id="programs" className="section-padding">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Explore Our Programs
          </h2>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Build practical skills in the technologies shaping tomorrow's careers. Get started with our core certificate tracks.
          </p>

          {/* Desktop Filter Layout */}
          <div className="hidden sm:flex justify-center gap-2.5 pt-4">
            {(['All', 'Cybersecurity', 'Data Science', 'Coming Soon'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all border ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-stone-950 border-amber-500 shadow font-bold'
                    : 'bg-stone-900 text-stone-300 border-stone-850 hover:border-stone-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Horizontal scrolling tabs */}
          <div className="sm:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-none px-4 -mx-4 justify-start">
            {(['All', 'Cybersecurity', 'Data Science', 'Coming Soon'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap border flex-shrink-0 ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-stone-950 border-amber-500'
                    : 'bg-stone-900 text-stone-350 border-stone-850'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {/* Dynamic Grid Layout */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-stone-900 border border-stone-850 rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-stone-950/60 rounded-xl" />
                <div className="h-4 bg-stone-950/60 rounded w-3/4" />
                <div className="h-3 bg-stone-950/60 rounded w-1/2" />
                <div className="h-6 bg-stone-950/60 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const isComingSoon = course.status === 'coming-soon';
              
              return (
                <div 
                  key={course.id}
                  onClick={() => {
                    if (!isComingSoon) {
                      navigate(`/courses/${course.slug}`);
                    }
                  }}
                  className={`bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300 shadow-xl group ${
                    !isComingSoon ? 'cursor-pointer' : ''
                  }`}
                >
                  {/* Course Card Header Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-950 border-b border-stone-850/60">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-deep-navy-950/80 backdrop-blur text-white text-[10px] font-bold rounded-md uppercase tracking-wider border border-white/10">
                      {course.category}
                    </span>
                    {isComingSoon && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-955 border border-amber-850/30 text-amber-450 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Course Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-stone-450 text-xs leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {course.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2.5 py-0.5 bg-stone-950 text-stone-300 text-[10px] font-bold rounded">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Metadata Footer stats */}
                    {!isComingSoon && (
                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-bold border-t border-stone-850 pt-4">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-stone-550" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-stone-550" />
                          {course.lessons} lessons
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-500">
                          <Star className="w-4 h-4 fill-current animate-pulse" />
                          {course.rating}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-stone-850">
                      {isComingSoon ? (
                        <div className="w-full space-y-2.5" onClick={(e) => e.stopPropagation()}>
                          {notifiedEmails[course.id] ? (
                            <span className="text-[11px] text-amber-400 font-bold text-center block py-2 bg-amber-500/5 border border-amber-550/20 rounded-xl">
                              ✓ You will be notified when this program opens!
                            </span>
                          ) : (
                            <form onSubmit={(e) => handleNotifySubmit(e, course.id)} className="flex gap-2">
                              <input
                                type="email"
                                required
                                placeholder="Enter email to notify"
                                value={emailInput[course.id] || ''}
                                onChange={(e) => handleEmailChange(course.id, e.target.value)}
                                className="flex-1 px-3 py-2 bg-stone-955 border border-stone-800 text-xs rounded-lg focus:outline-none focus:border-amber-500 text-white placeholder-stone-600 transition-all"
                              />
                              <button
                                type="submit"
                                className="px-3 py-2 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                              >
                                Notify
                              </button>
                            </form>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="text-stone-500 text-[10px] line-through font-semibold leading-none">
                              ₹{course.originalPrice}
                            </span>
                            <span className="text-white font-display font-extrabold text-lg leading-tight">
                              ₹{course.price}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/courses/${course.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="btn-secondary px-3.5 py-2 text-xs font-bold rounded-lg"
                            >
                              Details
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnrollClick(course);
                              }}
                              className="btn-primary px-3.5 py-2 text-xs font-bold rounded-lg"
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
      </section>

      {/* 6. CYBERSECURITY FEATURED PROGRAM SECTION */}
      <section className="bg-[#0f0d0b] text-white py-20 relative overflow-hidden border-y border-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(217,119,6,0.06),transparent_45%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-block px-3 py-1 bg-amber-950/20 border border-amber-900/25 text-amber-450 text-xs font-semibold rounded-md uppercase tracking-wider">
              Featured Track // Available Now
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              Master Cybersecurity Through <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Practical Defensive Learning
              </span>
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed max-w-2xl">
              Gain intermediate to advanced defensive hacking capabilities. Oxyfied is structured around defensive configurations, system pen-testing scans, network captures, and auditing report methodologies. Build actual competence in:
            </p>

            {/* Grid checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
              {[
                'Cybersecurity Fundamentals',
                'Ethical Hacking Scanning & Vulns',
                'Networking & Wireshark Captures',
                'Web Application Security',
                'Linux Command Line Hardening',
                'Vulnerability Assessments',
                'Firewalls & Snort IDS Setup',
                'SIEM Logs Splunk Monitoring'
              ].map((skill) => (
                <div key={skill} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-medium text-stone-300">{skill}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link to="/courses/cybersecurity" className="btn-primary px-6 py-3 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow">
                Explore Cybersecurity
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500 animate-pulse" />
                Includes 3 Hands-On Labs & Capstone Audit
              </span>
            </div>
          </div>

          {/* Right Column visual box */}
          <div className="lg:col-span-5 bg-stone-900/60 border border-stone-850 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
            <h3 className="font-display font-semibold text-sm text-stone-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-450 animate-ping" />
              Curriculum Outline
            </h3>
            
            <div className="space-y-3 text-xs">
              {[
                { module: 'Module 1-3', title: 'Linux, Networking & Security Fundamentals' },
                { module: 'Module 4-6', title: 'Ethical Hacking, Web & Network Exploits' },
                { module: 'Module 7-8', title: 'Vulnerability Analysis & SIEM Operations' },
                { module: 'Module 9-10', title: 'Defensive Labs & Capstone Audit Project' }
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-stone-950 rounded-xl border border-stone-850 hover:border-amber-500/25 transition-colors">
                  <div className="text-left">
                    <span className="text-[10px] text-amber-500 font-bold block">{step.module}</span>
                    <span className="font-semibold text-stone-200 mt-0.5 block">{step.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Verified</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. DATA SCIENCE FEATURED PROGRAM SECTION */}
      <section className="bg-stone-955 py-20 relative border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column visual display */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative bg-[#141210] border border-stone-850 rounded-2xl p-6 shadow-2xl">
              <span className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 text-stone-950 text-[10px] font-bold rounded uppercase tracking-wider">
                Tools & Technologies Covered
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-center">
                {[
                  { name: 'Python', desc: 'Core Programming' },
                  { name: 'Pandas', desc: 'Data Manipulation' },
                  { name: 'NumPy', desc: 'Matrix Math' },
                  { name: 'SQL', desc: 'Database Querying' },
                  { name: 'Matplotlib', desc: 'Data Plotting' },
                  { name: 'Seaborn', desc: 'Statistical Plots' },
                  { name: 'Scikit-Learn', desc: 'Machine Learning' },
                  { name: 'Jupyter', desc: 'Notebook Workspaces' },
                  { name: 'Git/GitHub', desc: 'Version Control' }
                ].map((tech) => (
                  <div key={tech.name} className="p-3 bg-stone-900 border border-stone-850 hover:border-amber-500/20 rounded-xl transition-all shadow-md">
                    <span className="text-sm font-bold text-white block">{tech.name}</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5 leading-tight">{tech.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Content */}
          <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
            <span className="inline-block px-3 py-1 bg-stone-900 border border-stone-850 text-stone-300 text-xs font-semibold rounded-md uppercase tracking-wider">
              Core Track // In-Demand Skills
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              Turn Data Into Decisions <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                With Project-Based Portfolios
              </span>
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Build a strong foundation in programmatic analytics. Rather than relying on simple spreadsheets, learn to write logic parameters, clean complex datasets, conduct statistical hypotheses, and train predictive machine learning pipelines.
            </p>

            <div className="space-y-3.5">
              {[
                { title: 'Write Clean Python Scripts', desc: 'Master variables, loops, custom function arguments, and library management pipelines.' },
                { title: 'Aggregate Large Scale Tabular Data', desc: 'Clean missing rows, merge disparate tables, and aggregate metrics using Pandas and NumPy arrays.' },
                { title: 'Build Predictive Models', desc: 'Configure linear regressions, classification trees, random forests, and parameter tuning grids.' }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{step.title}</h4>
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link to="/courses/data-science" className="btn-primary px-6 py-3 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow">
                Explore Data Science
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500 animate-pulse" />
                Includes 3 Business Projects & Streamlit App
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. WHY Oxyfied */}
      <section className="bg-[#0f0d0b] border-b border-stone-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Why Learn With Oxyfied?
            </h2>
            <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
              We focus on building functional ability rather than offering standard passive video watching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Practical Learning', icon: Layers, desc: 'Every topic is mapped directly to command outputs, coding environments, or terminal interactions.' },
              { title: 'Industry-Relevant Curriculum', icon: ShieldCheck, desc: 'Syllabus guidelines are designed around production tech requirements, avoiding outdated logic.' },
              { title: 'Real-World Projects', icon: Award, desc: 'Complete projects using actual code parameters, building a Github portfolio that stands out in recruiter reviews.' },
              { title: 'Expert Guidance', icon: Users, desc: 'Courses are created and curated by industry practitioners who have guided enterprise systems configurations.' },
              { title: 'Flexible Learning Pace', icon: Clock, desc: 'Learn on your schedule. Access lesson videos, datasets, resource files, and test files indefinitely.' },
              { title: 'Career-Focused Skills', icon: TrendingUp, desc: 'Every lesson targets skills needed for junior to mid-level technician functions in modern engineering fields.' }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl hover:border-amber-500/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-amber-550/10 flex items-center justify-center text-amber-400 mb-4 border border-amber-500/20">
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. STATISTICS */}
      <section className="bg-stone-950 text-white py-16 relative overflow-hidden border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
          {statsData.map((stat) => (
            <div key={stat.id} className="space-y-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold bg-gradient-to-r from-white via-stone-200 to-amber-405 bg-clip-text text-transparent block">
                {stat.value}
              </span>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 10. HOW IT WORKS */}
      <section className="section-padding">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            How Oxyfied Works
          </h2>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            A simple 4-step path from selecting your course to obtaining your career verification.
          </p>
        </div>

        {/* Desktop Horizontal Timeline */}
        <div className="hidden lg:grid grid-cols-4 gap-8 relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-800 -translate-y-1/2 z-0" />
          
          {[
            { step: '01', title: 'Choose Your Course', desc: 'Select between Cybersecurity or Data Science tracks based on your career interests.' },
            { step: '02', title: 'Learn Through Practical Content', desc: 'Interact with direct command parameters, system tools, and detailed script modules.' },
            { step: '03', title: 'Build Real Projects', desc: 'Write actual code to resolve challenges, compiling a portfolio recruiters review.' },
            { step: '04', title: 'Earn Your Certificate', desc: 'Submit assignments to verify competencies and earn digital shareable verification.' }
          ].map((item, idx) => (
            <div key={idx} className="relative z-10 bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl space-y-3 hover:border-amber-500/20 transition-colors">
              <span className="text-2xl font-display font-extrabold text-amber-500 block leading-none">{item.step}</span>
              <h3 className="font-display font-bold text-sm text-white">{item.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="lg:hidden space-y-6 relative pl-6 border-l border-stone-800">
          {[
            { step: '01', title: 'Choose Your Course', desc: 'Select between Cybersecurity or Data Science tracks based on your career interests.' },
            { step: '02', title: 'Learn Through Practical Content', desc: 'Interact with direct command parameters, system tools, and detailed script modules.' },
            { step: '03', title: 'Build Real Projects', desc: 'Write actual code to resolve challenges, compiling a portfolio recruiters review.' },
            { step: '04', title: 'Earn Your Certificate', desc: 'Submit assignments to verify competencies and earn digital shareable verification.' }
          ].map((item, idx) => (
            <div key={idx} className="relative space-y-2">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-amber-500 border-4 border-stone-900 shadow-md animate-pulse" />
              <span className="text-xl font-display font-extrabold text-amber-500 block leading-none">{item.step}</span>
              <h3 className="font-display font-bold text-sm text-white">{item.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. TESTIMONIALS */}
      <section className="bg-[#0f0d0b] border-y border-stone-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              What Our Learners Say
            </h2>
            <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
              Read real stories from graduates who pivoted into security and analytics roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((item) => (
              <div key={item.id} className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/20 transition-all duration-300">
                <p className="text-stone-300 text-xs italic leading-relaxed">
                  "{item.content}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-850">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-stone-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{item.name}</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">{item.role}</span>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current animate-pulse" />
                      ))}
                    </div>
                    <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded uppercase">
                      {item.courseName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. INSTRUCTOR SECTION */}
      <section className="section-padding">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Learn From Experienced Professionals
          </h2>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Oxyfied tracks are crafted by practitioners who have managed enterprise systems, engineered datasets, and conducted security audits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {instructors.map((item) => (
            <div key={item.id} className="bg-stone-900 border border-stone-850 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-amber-500/20 transition-colors">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 rounded-2xl object-cover border border-stone-800 flex-shrink-0"
              />
              <div className="space-y-2.5 text-center sm:text-left">
                <div>
                  <h3 className="font-display font-bold text-base text-white">{item.name}</h3>
                  <span className="text-xs text-amber-550 font-bold block mt-0.5">{item.role}</span>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed">
                  {item.bio}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {(item.expertise || []).map((exp) => (
                    <span key={exp} className="px-2 py-0.5 bg-stone-950 text-stone-300 text-[10px] font-semibold rounded">
                      {exp}
                    </span>
                  ))}
                </div>
                <a
                  href={item.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-bold"
                >
                  View LinkedIn Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 13. RESOURCES (Blog Highlights) */}
      <section className="bg-[#0f0d0b] border-t border-stone-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4 text-left">
            <div>
              <h2 className="text-3xl font-display font-extrabold text-white">
                Latest Resources & Insights
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Stay updated on security compliance roadmaps, python libraries, and data science strategies.
              </p>
            </div>
            <Link to="/resources" className="btn-secondary text-xs px-5 py-2.5 font-bold rounded-lg whitespace-nowrap">
              All Resources
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl hover:border-amber-500/20 transition-all duration-300">
                <div className="aspect-[16/10] overflow-hidden bg-stone-950">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">
                      {post.category}
                    </span>
                    <h3 className="font-display font-bold text-sm text-white hover:text-amber-400 transition-colors line-clamp-2">
                      <Link to={`/resources/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-stone-400 text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-semibold pt-3 border-t border-stone-850">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. FINAL CTA */}
      <section className="bg-gradient-to-tr from-[#0f0d0b] to-[#1e1305] text-white py-20 text-center relative overflow-hidden border-t border-stone-900">
        {/* Visual Blur */}
        <div className="absolute w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -bottom-36 -right-36" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight">
            Ready to Build Your Next Skill?
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Start learning practical technology skills with Oxyfied. Join our live programs today and prepare for system-audits or predictive data roles.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/courses" className="btn-primary px-8 py-3 text-xs font-bold rounded-lg shadow">
              Explore Courses
            </Link>
            <Link to="/register" className="btn-secondary px-8 py-3 text-xs font-bold rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

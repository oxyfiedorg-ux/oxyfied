import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, Star, CheckCircle2, 
  ChevronRight, Award, ArrowRight, User, Loader2
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types';
import { Accordion } from '../../components/ui/Accordion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../../components/common/SEO';

export const CourseDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isEnrolled } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'faqs'>('overview');

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await courseService.getCourseBySlug(slug);
        if (data) {
          setCourse(data);
        } else {
          setError('Course program not found.');
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
        setError('Failed to fetch course details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] bg-stone-955 flex flex-col items-center justify-center space-y-4 text-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-400 font-semibold uppercase tracking-widest">Loading Program Details...</span>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-[60vh] bg-stone-955 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-white font-display">{error || 'Course Not Found'}</h2>
        <p className="text-xs text-stone-400">The requested course program does not exist or has been relocated.</p>
        <Link to="/courses" className="btn-primary px-5 py-2.5 text-xs font-semibold rounded-lg shadow">
          Back to Courses
        </Link>
      </div>
    );
  }

  const instructor = course.instructor || {
    id: 'lead-instructor',
    name: 'Lead Instructor',
    role: 'Expert Practitioner',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    bio: 'Industry professional dedicated to teaching system administration and engineering.',
    expertise: ['Technology'],
    linkedin: 'https://linkedin.com'
  };
  const userEnrolled = isEnrolled(course.id);

  // Handle Enrollment navigation
  const handleEnrollment = () => {
    if (userEnrolled) {
      navigate('/dashboard/my-courses');
      return;
    }

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

  // Convert Curriculum Modules to Accordion Schema
  const curriculumItems = (course.modules || []).map((mod) => ({
    id: mod.id,
    title: mod.title,
    subtitle: `${mod.lessons.length} Lessons`,
    content: (
      <ul className="space-y-2 text-xs text-stone-400">
        {mod.lessons.map((lesson) => (
          <li key={lesson.id} className="flex items-center justify-between py-1.5 border-b border-stone-850 last:border-0">
            <span className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-stone-550" />
              <span className="font-medium text-stone-300">{lesson.title}</span>
            </span>
            <div className="flex items-center gap-2.5">
              {lesson.isPreview && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/20 text-emerald-450 border border-emerald-900/30 text-[9px] font-bold uppercase tracking-wider">
                  Preview
                </span>
              )}
              <span className="text-[10px] text-stone-500 font-mono">{lesson.duration}</span>
            </div>
          </li>
        ))}
      </ul>
    )
  }));

  // FAQ mock items
  const faqItems = [
    {
      id: 'faq-1',
      title: 'Is this course suitable for complete beginners?',
      content: 'Yes! Both Cybersecurity and Data Science Certificate programs start from absolute scratch. No prior coding or systems administration history is required. We teach Linux command lines, Python syntax, and database query setups in the initial modules.'
    },
    {
      id: 'faq-2',
      title: 'Do I get a certificate upon completion?',
      content: 'Absolutely. Once you finish all lesson modules, submit the practical lab assignments, and complete the Capstone audit/notebook program, you will earn a verifiable digital Oxyfied Certificate of Completion to showcase on LinkedIn or your resume.'
    },
    {
      id: 'faq-3',
      title: 'Are the labs simulated or live?',
      content: 'The labs are designed to run on your actual machine or via local virtualized hosts (like Kali/Ubuntu VMs) to simulate raw production tasks. This project-focused design ensures you build practical competencies instead of clicking through static HTML simulators.'
    },
    {
      id: 'faq-4',
      title: 'How long do I have access to the materials?',
      content: 'You receive lifetime access to all enrolled course videos, syllabus code files, resources, cheat sheets, and future curriculum patch updates. There are no monthly subscriptions.'
    }
  ].map((faq) => ({
    id: faq.id,
    title: faq.title,
    content: <p className="text-xs leading-relaxed text-stone-400">{faq.content}</p>
  }));

  // Mock Reviews
  const reviews = [
    { name: 'Alexander P.', rating: 5, date: '1 month ago', text: 'Excellent depth. The Splunk log queries and ethical hacking Scanning modules were extremely detailed. The capstone audit is highly technical.' },
    { name: 'Meera S.', rating: 5, date: '2 weeks ago', text: 'I appreciated the statistics and pandas cleaning layouts. The ML regressions models are thoroughly explained.' }
  ];

  return (
    <div className="bg-stone-955 min-h-screen">
      <SEO 
        title={course.title}
        description={course.description}
        canonical={`/courses/${course.slug}`}
        ogImage={course.image}
      />
      {/* 20. Course Details Hero */}
      <section className="bg-[#0f0d0b] text-white py-16 border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-left">
          <div className="flex items-center gap-1 text-stone-400 text-xs font-semibold">
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-500">{course.category}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight max-w-4xl">
            {course.title}
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            {course.description}
          </p>

          {/* Quick stats indicators */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-stone-400">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-450 fill-current animate-pulse" />
              <span className="text-white">{course.rating}</span> ({course.students} Learners Enrolled)
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {course.lessons} Lessons
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Level: {course.level}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Layout (Grid: Main (8) vs sticky sidebar (4)) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-stone-850 gap-6 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold text-stone-400">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'curriculum', label: 'Curriculum' },
              { id: 'instructor', label: 'Instructor' },
              { id: 'faqs', label: 'FAQs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3.5 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-500 font-bold'
                    : 'border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8 text-left">
              {/* What You'll Learn section */}
              <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="font-display font-bold text-base text-white">What You'll Learn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {course.skills.map((skill) => (
                    <div key={skill} className="flex items-start gap-2.5 text-xs text-stone-300 font-medium">
                      <CheckCircle2 className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements & Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requirements */}
                <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl space-y-3.5">
                  <h4 className="font-display font-bold text-sm text-white">Requirements</h4>
                  <ul className="space-y-2 text-xs text-stone-400 leading-relaxed list-disc pl-4">
                    {course.requirements?.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Target Audience */}
                <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl space-y-3.5">
                  <h4 className="font-display font-bold text-sm text-white">Who This Course Is For</h4>
                  <ul className="space-y-2 text-xs text-stone-400 leading-relaxed list-disc pl-4">
                    {course.whoIsItFor?.map((who, i) => (
                      <li key={i}>{who}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Certificate Section */}
              <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 text-amber-405 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="font-display font-bold text-sm text-white">Shareable Digital Verification</h4>
                  <p className="text-xs text-stone-450 leading-relaxed">
                    Upon passing the Capstone practical audit assignment parameters, you will earn a verifiable digital Oxyfied Certificate of Completion to display on LinkedIn.
                  </p>
                </div>
              </div>

              {/* Reviews/Feedbacks */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm text-white">Recent Learner Feedback</h4>
                <div className="space-y-3">
                  {reviews.map((rev, i) => (
                    <div key={i} className="bg-stone-900 border border-stone-850 p-4 rounded-xl shadow-xl text-xs space-y-2">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-stone-200">{rev.name}</span>
                        <span className="text-stone-500 font-normal">{rev.date}</span>
                      </div>
                      <div className="flex text-amber-450 gap-0.5">
                        {[...Array(rev.rating)].map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-current animate-pulse" />
                        ))}
                      </div>
                      <p className="text-stone-400 leading-relaxed">"{rev.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Curriculum Accordions */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                <h3 className="font-display font-bold text-base text-white">Course Syllabus</h3>
                <span className="text-xs text-stone-400 font-semibold uppercase">{course.lessons} Lessons</span>
              </div>
              <Accordion items={curriculumItems} allowMultiple={true} defaultOpenId={course.modules?.[0]?.id} />
            </div>
          )}

          {/* Tab: Instructors */}
          {activeTab === 'instructor' && (
            <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 text-left">
              <img
                src={instructor.image}
                alt={instructor.name}
                className="w-24 h-24 rounded-2xl object-cover border border-stone-800 flex-shrink-0"
              />
              <div className="space-y-3">
                <div>
                  <h3 className="font-display font-bold text-lg text-white leading-none">{instructor.name}</h3>
                  <span className="text-xs text-amber-500 font-semibold mt-1 block">{instructor.role}</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {instructor.bio}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(instructor.expertise || []).map((exp) => (
                    <span key={exp} className="px-2.5 py-0.5 bg-stone-950 text-stone-300 text-[10px] font-bold rounded">
                      {exp}
                    </span>
                  ))}
                </div>
                <a
                  href={instructor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-bold hover:text-amber-450 pt-1"
                >
                  View LinkedIn Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Tab: FAQs */}
          {activeTab === 'faqs' && (
            <div className="space-y-4 text-left">
              <h3 className="font-display font-bold text-base text-white border-b border-stone-850 pb-2">
                Frequently Asked Questions
              </h3>
              <Accordion items={faqItems} allowMultiple={true} />
            </div>
          )}

        </div>

        {/* Right Column: Pricing card (4 cols) */}
        <aside className="lg:col-span-4 bg-[#141210] border border-stone-850 rounded-2xl shadow-2xl overflow-hidden sticky top-24">
          <div className="aspect-[16/10] overflow-hidden bg-stone-950 border-b border-stone-850/60">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Course Pricing</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-extrabold text-white">${course.price}</span>
                <span className="text-sm text-stone-505 line-through font-semibold">${course.originalPrice}</span>
                <span className="text-xs font-bold text-emerald-450 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">60% Off</span>
              </div>
            </div>

            <button
              onClick={handleEnrollment}
              className="btn-primary w-full py-3.5 font-bold rounded-xl shadow-md"
            >
              {userEnrolled ? 'Go to Classroom' : 'Enroll Now'}
            </button>

            {/* Checklist of features */}
            <div className="space-y-3 text-xs text-stone-300 font-medium pt-2 border-t border-stone-850">
              <span className="text-[10px] uppercase text-stone-500 font-bold block tracking-widest mb-1">Includes</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Lifetime access to all lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>3 Hands-On Labs and assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Shareable completion certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Active Q&A and support forum access</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Reusable micro icon wrapper inside curriculum
const Play: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

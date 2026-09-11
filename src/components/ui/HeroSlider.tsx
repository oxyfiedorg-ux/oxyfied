import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  Play,
  Laptop,
  Code2,
  Award,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Shield,
  Bot,
  Star,
  X,
  Sparkles,
  Database,
  Lock,
  Server
} from 'lucide-react';

interface PopularProgramItem {
  id: string;
  title: string;
  description: string;
  level: string;
  href: string;
  iconBg: string;
  customIcon?: React.ReactNode;
}

interface HeroSlideItem {
  id: string;
  badge: {
    icon: React.ElementType;
    text: string;
  };
  headline: {
    line1: string;
    line2: string;
    line3: string;
    highlightLine: 1 | 2 | 3;
  };
  subtitle: string;
  features: {
    icon: React.ElementType;
    text: string;
  }[];
  backgroundImage: string;
  backgroundAlt: string;
  objectPosition?: string;
  leftDoodle: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    highlightLine: 1 | 2 | 3 | 4;
  };
  rightDoodle: {
    line1: string;
    line2: string;
    line3: string;
    highlightLine: 1 | 2 | 3;
  };
  popularProgramsTitle: string;
  popularPrograms: PopularProgramItem[];
}

const HERO_SLIDES: HeroSlideItem[] = [
  // SLIDE 1 (Original Master Hero Slide)
  {
    id: 'general-mastery',
    badge: {
      icon: GraduationCap,
      text: 'Learn • Build • Grow'
    },
    headline: {
      line1: 'Practical Skills.',
      line2: 'Real Projects.',
      line3: 'Better Future.',
      highlightLine: 3
    },
    subtitle: 'Short, hands-on, industry-relevant courses to help you build in-demand skills, work on real projects, and get job-ready in today’s fast-evolving world.',
    features: [
      { icon: Laptop, text: 'Live Online Classes' },
      { icon: Code2, text: 'Real-World Projects' },
      { icon: Award, text: 'Industry Certified' },
      { icon: Briefcase, text: 'Job Support & Career Guidance' }
    ],
    backgroundImage: '/hero_boy.jpg',
    backgroundAlt: 'Student learning coding on laptop with tech textbooks',
    objectPosition: 'object-[54%_42%]',
    leftDoodle: {
      line1: 'Better',
      line2: 'Skills',
      line3: 'Bigger',
      line4: 'Opportunities',
      highlightLine: 3
    },
    rightDoodle: {
      line1: 'Your',
      line2: 'Next Skill',
      line3: 'Starts Here',
      highlightLine: 2
    },
    popularProgramsTitle: 'Popular Programs',
    popularPrograms: [
      {
        id: 'odoo',
        title: 'Odoo',
        description: 'Build real business solutions with Odoo ERP.',
        level: 'Beginner - Advanced',
        href: '/courses',
        iconBg: 'bg-[#00A09D]',
        customIcon: (
          <span className="font-extrabold text-white text-[11px] tracking-tight">
            odoo
          </span>
        )
      },
      {
        id: 'aws',
        title: 'AWS',
        description: 'Learn cloud, deploy real projects, get industry ready.',
        level: 'Beginner - Advanced',
        href: '/courses',
        iconBg: 'bg-[#232F3E]',
        customIcon: (
          <span className="font-extrabold text-[#FF9900] text-[10px] tracking-tight">
            aws
          </span>
        )
      },
      {
        id: 'mern-ai',
        title: 'MERN Stack with AI',
        description: 'Build full-stack web apps with modern AI tools.',
        level: 'Intermediate - Advanced',
        href: '/courses/master-program-python',
        iconBg: 'bg-[#087EA4]',
        customIcon: (
          <svg className="w-4 h-4 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
          </svg>
        )
      },
      {
        id: 'cyber-security',
        title: 'Cyber Security',
        description: 'Learn to protect, detect and secure real-world systems.',
        level: 'Beginner - Advanced',
        href: '/courses/cybersecurity-ethical-hacking',
        iconBg: 'bg-[#1E40AF]',
        customIcon: <Shield className="w-4 h-4 text-white" />
      },
      {
        id: 'ai-agent',
        title: 'AI Agent',
        description: 'Create intelligent agents using modern AI frameworks.',
        level: 'Intermediate - Advanced',
        href: '/courses/master-program-data-science-ai',
        iconBg: 'bg-[#7C3AED]',
        customIcon: <Bot className="w-4 h-4 text-white" />
      }
    ]
  },

  // SLIDE 2 (Cybersecurity & Defensive Engineering Focus)
  {
    id: 'cybersecurity-defense',
    badge: {
      icon: Shield,
      text: 'Defend • Protect • Master'
    },
    headline: {
      line1: 'Defend Systems.',
      line2: 'Mitigate Threats.',
      line3: 'Lead Cyber Security.',
      highlightLine: 3
    },
    subtitle: 'Practice network packet captures, port auditing, firewall deployments, and defensive exploitation mitigations in isolated browser sandboxes.',
    features: [
      { icon: Laptop, text: 'Live Wireshark & SIEM Labs' },
      { icon: Code2, text: 'Real Incident Scenarios' },
      { icon: Award, text: 'SOC & Pen-Test Ready' },
      { icon: Briefcase, text: '1-on-1 Security Audits' }
    ],
    backgroundImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
    backgroundAlt: 'Cybersecurity and software student working on laptop in modern studio',
    objectPosition: 'object-[52%_35%]',
    leftDoodle: {
      line1: 'Secure',
      line2: 'Code',
      line3: 'Stronger',
      line4: 'Infrastructure',
      highlightLine: 3
    },
    rightDoodle: {
      line1: 'Master',
      line2: 'Cyber Defense',
      line3: 'From Day One',
      highlightLine: 2
    },
    popularProgramsTitle: 'Security Programs',
    popularPrograms: [
      {
        id: 'cyber-master',
        title: 'Cybersecurity & Ethical Hacking',
        description: 'Master ethical penetration testing & defenses.',
        level: 'Beginner - Advanced',
        href: '/courses/cybersecurity-ethical-hacking',
        iconBg: 'bg-[#1E40AF]',
        customIcon: <Shield className="w-4 h-4 text-white" />
      },
      {
        id: 'soc-analyst',
        title: 'SOC Analyst & Threat Intelligence',
        description: 'Splunk SIEM, incident response & log triage.',
        level: 'Intermediate',
        href: '/courses/soc-analyst-threat-intelligence',
        iconBg: 'bg-[#D95716]',
        customIcon: <Lock className="w-4 h-4 text-white" />
      },
      {
        id: 'cloud-security',
        title: 'Cloud Security & DevSecOps',
        description: 'Hardening AWS, Azure & Kubernetes clusters.',
        level: 'Intermediate - Advanced',
        href: '/courses/cloud-security-devsecops',
        iconBg: 'bg-[#0D9488]',
        customIcon: <Server className="w-4 h-4 text-white" />
      },
      {
        id: 'network-defense',
        title: 'Network Defense & Protocol Audit',
        description: 'Wireshark deep packet inspection & IDS.',
        level: 'Beginner - Intermediate',
        href: '/courses',
        iconBg: 'bg-[#4338CA]',
        customIcon: <Sparkles className="w-4 h-4 text-white" />
      },
      {
        id: 'owasp-sec',
        title: 'Web Application Security',
        description: 'OWASP Top 10 vulnerabilities & code patching.',
        level: 'Beginner - Advanced',
        href: '/courses',
        iconBg: 'bg-[#7C3AED]',
        customIcon: <Code2 className="w-4 h-4 text-white" />
      }
    ]
  },

  // SLIDE 3 (AI, Data Science & Modern Cloud Focus)
  {
    id: 'ai-data-cloud',
    badge: {
      icon: Bot,
      text: 'AI Agents • Cloud • Data'
    },
    headline: {
      line1: 'Build AI Agents.',
      line2: 'Deploy Cloud.',
      line3: 'Scale What Matters.',
      highlightLine: 3
    },
    subtitle: 'Architect autonomous LLM workflows, vector embeddings, high-throughput cloud microservices, and predictive machine learning models.',
    features: [
      { icon: Laptop, text: 'Interactive Python Notebooks' },
      { icon: Code2, text: 'Production ML Pipelines' },
      { icon: Award, text: 'Enterprise Scale Projects' },
      { icon: Briefcase, text: '1-on-1 Senior Code Reviews' }
    ],
    backgroundImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1600&auto=format&fit=crop',
    backgroundAlt: 'Data science and AI students training models collaboratively',
    objectPosition: 'object-[50%_35%]',
    leftDoodle: {
      line1: 'Smarter',
      line2: 'Agents',
      line3: 'Scalable',
      line4: 'Architectures',
      highlightLine: 3
    },
    rightDoodle: {
      line1: 'Build',
      line2: 'Modern AI',
      line3: 'Step by Step',
      highlightLine: 2
    },
    popularProgramsTitle: 'AI & Data Programs',
    popularPrograms: [
      {
        id: 'data-science-ai',
        title: 'Data Science & AI Specialist',
        description: 'Python, predictive modeling & deep learning.',
        level: 'Beginner - Advanced',
        href: '/courses/master-program-data-science-ai',
        iconBg: 'bg-[#7C3AED]',
        customIcon: <Bot className="w-4 h-4 text-white" />
      },
      {
        id: 'ai-agents-pipeline',
        title: 'Autonomous AI Agents',
        description: 'LangChain, vector stores & tool-calling agents.',
        level: 'Intermediate - Advanced',
        href: '/courses/master-program-data-science-ai',
        iconBg: 'bg-[#087EA4]',
        customIcon: <Database className="w-4 h-4 text-white" />
      },
      {
        id: 'aws-cloud',
        title: 'AWS Cloud Solutions Architect',
        description: 'Serverless, container orchestration & scaling.',
        level: 'Beginner - Advanced',
        href: '/courses',
        iconBg: 'bg-[#232F3E]',
        customIcon: (
          <span className="font-extrabold text-[#FF9900] text-[10px] tracking-tight">
            aws
          </span>
        )
      },
      {
        id: 'python-fullstack',
        title: 'Python Full Stack with AI',
        description: 'FastAPI, React, Postgres & LLM integration.',
        level: 'Beginner - Advanced',
        href: '/courses/master-program-python',
        iconBg: 'bg-[#15803D]',
        customIcon: <Code2 className="w-4 h-4 text-white" />
      },
      {
        id: 'power-bi',
        title: 'Power BI & Business Analytics',
        description: 'DAX modeling, executive KPI dashboards & ETL.',
        level: 'Beginner - Advanced',
        href: '/courses',
        iconBg: 'bg-[#D97706]',
        customIcon: <Sparkles className="w-4 h-4 text-white" />
      }
    ]
  }
];

export const HeroSlider: React.FC = () => {
  const [[currentSlideIndex, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const paginate = useCallback((newDirection: number) => {
    setSlide(([prevPage]) => {
      const nextPage = (prevPage + newDirection + HERO_SLIDES.length) % HERO_SLIDES.length;
      return [nextPage, newDirection];
    });
  }, []);

  const goToSlide = useCallback((newIndex: number) => {
    setSlide(([prevPage]) => {
      if (newIndex === prevPage) return [prevPage, 0];
      const newDir = newIndex > prevPage ? 1 : -1;
      return [newIndex, newDir];
    });
  }, []);

  const nextSlide = useCallback(() => paginate(1), [paginate]);
  const prevSlide = useCallback(() => paginate(-1), [paginate]);

  // Preload all slide background images for zero-lag transitions
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.backgroundImage;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVideoModalOpen) return;
      if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVideoModalOpen, paginate]);

  // Automatic slide transition every 5 seconds (pauses on hover or when video modal is open)
  useEffect(() => {
    if (isVideoModalOpen || isHovered) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [isVideoModalOpen, isHovered, paginate]);

  const slide = HERO_SLIDES[currentSlideIndex];
  const BadgeIcon = slide.badge.icon;

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : dir < 0 ? -40 : 0,
      opacity: 0,
      filter: 'blur(3px)',
      scale: 0.99
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 30, mass: 0.8 },
        scale: { duration: 0.45, ease: 'easeOut' },
        opacity: { duration: 0.45, ease: 'easeOut' },
        filter: { duration: 0.35, ease: 'easeOut' }
      }
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? -40 : dir < 0 ? 40 : 0,
      opacity: 0,
      filter: 'blur(3px)',
      scale: 0.99,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 30, mass: 0.8 },
        scale: { duration: 0.3, ease: 'easeIn' },
        opacity: { duration: 0.3, ease: 'easeIn' },
        filter: { duration: 0.25, ease: 'easeIn' }
      }
    })
  };

  return (
    <section 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="relative w-full overflow-hidden bg-warm-ivory border-b border-light-taupe/70 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-68px)] flex flex-col justify-between pt-2 sm:pt-4 pb-0 select-none group"
    >
      
      {/* ===============================================================
          SEAMLESS CENTER-SPREAD HERO PHOTO WITH SOFT GRADIENT BLENDING
      ================================================================ */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="relative w-full h-full max-w-[1680px] flex items-center justify-center overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.img
              key={slide.id}
              src={slide.backgroundImage}
              alt={slide.backgroundAlt}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.95, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{
                opacity: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
              }}
              className={`absolute inset-0 w-full h-full object-cover ${slide.objectPosition || 'object-center'}`}
              style={{
                maskImage: 'radial-gradient(ellipse 75% 70% at 53% 45%, black 45%, rgba(0,0,0,0.85) 65%, transparent 92%)',
                WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 53% 45%, black 45%, rgba(0,0,0,0.85) 65%, transparent 92%)'
              }}
            />
          </AnimatePresence>

          {/* Left, Right, Top and Bottom Soft Gradient Blend Overlays */}
          <div 
            className="absolute inset-0 pointer-events-none z-1"
            style={{
              background: 'linear-gradient(to right, #F8F3EA 0%, rgba(248, 243, 234, 0.98) 28%, rgba(248, 243, 234, 0.55) 42%, transparent 52%, rgba(248, 243, 234, 0.2) 64%, rgba(248, 243, 234, 0.88) 84%, #F8F3EA 100%)'
            }}
          />
          <div 
            className="absolute inset-0 pointer-events-none z-1"
            style={{
              background: 'linear-gradient(to bottom, #F8F3EA 0%, rgba(248, 243, 234, 0.3) 8%, transparent 20%, transparent 75%, rgba(248, 243, 234, 0.9) 95%, #F8F3EA 100%)'
            }}
          />
        </div>
      </div>

      {/* Background Soft Ambient Light Gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-burnt-orange/[0.04] rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none z-0" />

      {/* Left Navigation Arrow */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/85 hover:bg-white border border-light-taupe/90 shadow-md items-center justify-center text-deep-navy hover:text-burnt-orange transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100 focus:outline-hidden"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Navigation Arrow */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden md:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/85 hover:bg-white border border-light-taupe/90 shadow-md items-center justify-center text-deep-navy hover:text-burnt-orange transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 focus:opacity-100 focus:outline-hidden"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Main Content Area Container - Centered Vertically */}
      <div className="relative z-10 w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex-1 flex flex-col justify-center py-2 sm:py-3 lg:py-4">
        
        {/* Animated Slide Content Wrapper with direction and swipe support */}
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -80 || offset.x < -60) {
                paginate(1);
              } else if (swipe > 80 || offset.x > 60) {
                paginate(-1);
              }
            }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 xl:gap-6 items-center cursor-grab active:cursor-grabbing"
          >
            
            {/* ===============================================================
                1. LEFT EDITORIAL CONTENT COLUMN (5 COLS ON DESKTOP)
            ================================================================ */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center text-left space-y-3 sm:space-y-3.5 lg:space-y-3.5">
              
              {/* Pill Eyebrow Badge */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#FEF5EE] border border-burnt-orange/25 text-burnt-orange font-bold text-xs sm:text-sm tracking-wide shadow-2xs">
                  <BadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-burnt-orange" />
                  <span>{slide.badge.text}</span>
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-[36px] lg:text-[36px] xl:text-[42px] 2xl:text-[46px] leading-[1.08] text-deep-navy tracking-tight">
                <span className={`block transition-colors duration-300 ${slide.headline.highlightLine === 1 ? 'text-burnt-orange' : ''}`}>
                  {slide.headline.line1}
                </span>
                <span className={`block mt-0.5 transition-colors duration-300 ${slide.headline.highlightLine === 2 ? 'text-burnt-orange' : ''}`}>
                  {slide.headline.line2}
                </span>
                <span className={`block mt-0.5 transition-colors duration-300 ${slide.headline.highlightLine === 3 ? 'text-burnt-orange' : ''}`}>
                  {slide.headline.line3}
                </span>
              </h1>

              {/* Concise Subtitle */}
              <p className="text-warm-gray text-xs sm:text-[13px] lg:text-[13px] xl:text-[14px] leading-relaxed font-normal max-w-lg">
                {slide.subtitle}
              </p>

              {/* 4 Feature Points with Orange Icons */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1">
                {slide.features.map((feat, fIdx) => {
                  const FeatIcon = feat.icon;
                  return (
                    <div key={fIdx} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                        <FeatIcon className="w-4 h-4 text-burnt-orange" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-deep-navy leading-tight">
                        {feat.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 sm:pt-2">
                {/* Primary Button */}
                <Link
                  to="/courses"
                  className="btn-primary h-11 sm:h-11.5 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-full shadow-md shadow-burnt-orange/25 hover:shadow-lg hover:shadow-burnt-orange/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Secondary Button */}
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="h-11 sm:h-11.5 px-5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 rounded-full bg-warm-white/95 hover:bg-white border border-light-taupe hover:border-deep-navy/40 text-deep-navy shadow-2xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <div className="w-5.5 h-5.5 rounded-full bg-burnt-orange/15 flex items-center justify-center text-burnt-orange">
                    <Play className="w-3 h-3 fill-burnt-orange text-burnt-orange translate-x-0.5" />
                  </div>
                  <span>Watch How It Works</span>
                </button>
              </div>

            </div>

            {/* ===============================================================
                2. CENTER COLUMN: HANDWRITTEN ANNOTATION (3 COLS)
            ================================================================ */}
            <div className="lg:col-span-3 xl:col-span-3 relative flex items-start justify-center h-full min-h-[120px] lg:min-h-[380px]">
              <div className="relative lg:absolute lg:top-6 lg:left-2 flex items-start gap-1 select-none pointer-events-none">
                <div className="text-left font-handwriting text-base sm:text-lg font-bold text-deep-navy leading-[1.05] rotate-[-6deg]">
                  <span>{slide.leftDoodle.line1}</span><br />
                  <span>{slide.leftDoodle.line2}</span><br />
                  <span className="text-deep-navy">{slide.leftDoodle.line3}</span><br />
                  <span>{slide.leftDoodle.line4}</span>
                </div>
                {/* Curved SVG Hand-Drawn Arrow */}
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-burnt-orange stroke-current fill-none -rotate-12 mt-2 ml-0.5"
                  viewBox="0 0 50 50"
                >
                  <path
                    d="M12,12 Q24,24 38,36"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M26,37 Q36,37 38,36 Q38,26 36,24"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* ===============================================================
                3. RIGHT COLUMN: POPULAR PROGRAMS FLOATING CARD (4 COLS)
            ================================================================ */}
            <div className="lg:col-span-4 xl:col-span-4 relative flex flex-col items-center lg:items-end justify-center">
              
              {/* Floating Popular Programs Card */}
              <div className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 shadow-2xl shadow-deep-navy/10 border border-light-taupe/80 space-y-2 relative z-10">
                
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-light-taupe/50 pb-2">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-deep-navy">
                    {slide.popularProgramsTitle}
                  </h3>
                  <Link
                    to="/courses"
                    className="text-[11px] sm:text-xs font-bold text-burnt-orange hover:text-deep-orange flex items-center gap-0.5 transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 5 Course List Items */}
                <div className="space-y-1">
                  {slide.popularPrograms.map((program) => (
                    <Link
                      key={program.id}
                      to={program.href}
                      className="p-1.5 sm:p-2 rounded-2xl hover:bg-warm-ivory/90 border border-transparent hover:border-light-taupe/80 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      {/* Left: Icon + Title & Description */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full ${program.iconBg} flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105`}
                        >
                          {program.customIcon}
                        </div>

                        <div className="min-w-0 flex-1 text-left">
                          <h4 className="text-xs font-bold text-deep-navy group-hover:text-burnt-orange transition-colors truncate">
                            {program.title}
                          </h4>
                          <p className="text-[10px] text-warm-gray truncate leading-tight mt-0.5">
                            {program.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Level Tag & Chevron */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-semibold bg-[#FEF5EE] text-burnt-orange border border-burnt-orange/20 whitespace-nowrap">
                          {program.level}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-warm-gray group-hover:text-burnt-orange group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>

              </div>

              {/* Bottom-Right Handwritten Doodle Note & Arrow */}
              <div className="relative w-full flex items-center justify-end pt-2 pr-2 select-none pointer-events-none">
                <svg
                  className="w-9 h-9 sm:w-11 sm:h-11 text-burnt-orange stroke-current fill-none -rotate-12 mr-1.5"
                  viewBox="0 0 50 50"
                >
                  <path
                    d="M10,40 Q25,30 35,15"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M24,14 Q34,14 35,15 Q35,25 35,26"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="text-left font-handwriting text-base sm:text-lg font-bold text-deep-navy leading-[1.05] rotate-[2deg]">
                  <span>{slide.rightDoodle.line1}</span><br />
                  <span className="text-burnt-orange">{slide.rightDoodle.line2}</span><br />
                  <span>{slide.rightDoodle.line3}</span>
                </div>
              </div>

            </div>

          </motion.div>
        </AnimatePresence>

        {/* Slider Navigation Dots / Indicator Strip */}
        <div className="flex items-center justify-center gap-2 pt-3 sm:pt-4 pb-2 z-20">
          {HERO_SLIDES.map((s, idx) => {
            const isActive = currentSlideIndex === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="group/dot relative py-2 px-1 flex items-center cursor-pointer focus:outline-hidden"
              >
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out relative ${
                    isActive
                      ? 'w-9 bg-burnt-orange shadow-xs'
                      : 'w-2.5 bg-light-taupe hover:bg-burnt-orange/50 hover:w-3.5'
                  }`}
                />
              </button>
            );
          })}
        </div>

      </div>

      {/* ===============================================================
          4. BOTTOM TRUST & SOCIAL PROOF STRIP (4 BENCHMARKS)
      ================================================================ */}
      <div className="relative z-10 w-full bg-warm-white/95 border-t border-light-taupe/80 py-3 sm:py-3.5 flex-shrink-0 shadow-2xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center justify-between">
            
            {/* Stat 1: 10,000+ Students */}
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                <GraduationCap className="w-5 h-5 text-burnt-orange" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-deep-navy">10,000+</p>
                <p className="text-[10px] sm:text-[11px] text-warm-gray font-medium">Students Enrolled</p>
              </div>
            </div>

            {/* Stat 2: 4.9/5 Average Rating */}
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                <Star className="w-5 h-5 fill-burnt-orange text-burnt-orange" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-deep-navy">4.9/5</p>
                <p className="text-[10px] sm:text-[11px] text-warm-gray font-medium">Average Rating</p>
              </div>
            </div>

            {/* Stat 3: 100% Practical Learning */}
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                <Laptop className="w-5 h-5 text-burnt-orange" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-deep-navy">100%</p>
                <p className="text-[10px] sm:text-[11px] text-warm-gray font-medium">Practical, Project-Based Learning</p>
              </div>
            </div>

            {/* Stat 4: 1-on-1 Mentor Support */}
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange flex-shrink-0 shadow-2xs">
                <Award className="w-5 h-5 text-burnt-orange" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-deep-navy">1-on-1</p>
                <p className="text-[10px] sm:text-[11px] text-warm-gray font-medium">Mentor Support</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ===============================================================
          5. INTERACTIVE "WATCH HOW IT WORKS" VIDEO MODAL
      ================================================================ */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-deep-navy/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-3xl bg-warm-white border border-light-taupe rounded-3xl overflow-hidden shadow-2xl text-left"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-light-taupe/80 bg-warm-ivory">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-burnt-orange/10 flex items-center justify-center text-burnt-orange">
                    <Play className="w-3.5 h-3.5 fill-burnt-orange" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm sm:text-base text-deep-navy">
                      How Oxyfied Learning Works
                    </h3>
                    <p className="text-[11px] text-warm-gray">
                      Interactive sandbox labs, real-world projects & 1-on-1 mentor guidance
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-light-taupe/50 text-deep-navy transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Video / Feature Walkthrough Body */}
              <div className="p-6 space-y-5">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-deep-navy shadow-inner flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop"
                    alt="Classroom preview"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-deep-navy/40 flex flex-col items-center justify-center text-center p-4">
                    <a
                      href="#classroom-experience"
                      onClick={() => setIsVideoModalOpen(false)}
                      className="w-16 h-16 rounded-full bg-burnt-orange hover:bg-deep-orange text-white flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Play className="w-7 h-7 fill-current translate-x-0.5" />
                    </a>
                    <span className="mt-3 text-xs sm:text-sm font-bold text-white drop-shadow">
                      Experience Live Sandbox Classroom
                    </span>
                  </div>
                </div>

                {/* 3 Step Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-warm-ivory border border-light-taupe">
                    <span className="text-[10px] font-extrabold text-burnt-orange uppercase">Step 01</span>
                    <h5 className="text-xs font-bold text-deep-navy mt-0.5">Live Interactive Cohort</h5>
                    <p className="text-[10px] text-warm-gray mt-1">Live weekly coding labs with industry mentors.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warm-ivory border border-light-taupe">
                    <span className="text-[10px] font-extrabold text-sage-green uppercase">Step 02</span>
                    <h5 className="text-xs font-bold text-deep-navy mt-0.5">Real-World Projects</h5>
                    <p className="text-[10px] text-warm-gray mt-1">Production codebases & real enterprise datasets.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warm-ivory border border-light-taupe">
                    <span className="text-[10px] font-extrabold text-burnt-orange uppercase">Step 03</span>
                    <h5 className="text-xs font-bold text-deep-navy mt-0.5">Career & Job Readiness</h5>
                    <p className="text-[10px] text-warm-gray mt-1">Resume audits, portfolio building & referrals.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-warm-ivory border-t border-light-taupe/80 flex items-center justify-between">
                <span className="text-xs text-warm-gray font-medium">Ready to master in-demand skills?</span>
                <Link
                  to="/courses"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="btn-primary px-4 py-2 text-xs font-bold rounded-xl"
                >
                  Explore All Programs
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

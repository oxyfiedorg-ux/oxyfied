import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Eye, Shield, Target, Users } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const About: React.FC = () => {
  return (
    <div className="bg-stone-950 min-h-screen">
      <SEO 
        title="About Us" 
        description="Learn about Oxyfied's mission, learning philosophy, and core values centered on building practical tech capabilities."
        canonical="/about"
      />
      {/* Hero Header */}
      <section className="bg-[#0f0d0b] text-white py-20 text-center relative overflow-hidden border-b border-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.06),transparent_45%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold text-amber-450 uppercase tracking-widest block">
            About Oxyfied
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white">
            Practical Skills. Real Projects. <span className="text-amber-400">Better Careers.</span>
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            We exist to close the gap between academic theory and real-world system requirements.
          </p>
        </div>
      </section>

      {/* Main Core Mission / Vision section */}
      <section className="section-padding grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
        {/* Mission */}
        <div className="bg-stone-900 border border-stone-850 p-8 rounded-2xl shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold text-white">Our Mission</h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            To provide technology enthusiasts and professionals with project-driven, highly practical pathways that build verifiable technological competencies. We avoid general passive lecture formats, focusing instead on code outputs, system configurations, and security practices.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-stone-900 border border-stone-850 p-8 rounded-2xl shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold text-white">Our Vision</h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            To establish Oxyfied as the most reliable, hands-on technology learning environment, helping learners globally transition directly into cybersecurity operations, data science roles, and system administration functions.
          </p>
        </div>
      </section>

      {/* Philosophy section */}
      <section className="bg-[#0f0d0b] border-y border-stone-900 py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Our Learning Philosophy
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            We believe the only way to build capability in engineering or security is to build systems, analyze errors, and secure hosts. In our tracks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">1. Focus on Code, Not Slides</span>
              <p className="text-xs text-stone-405 leading-relaxed">We teach concepts through live terminals, python notebook sheets, and configuration audits.</p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">2. Learn Defensive Hardening</span>
              <p className="text-xs text-stone-405 leading-relaxed">Security is not just scanning; it is knowing how to patch directories, deploy firewalls, and verify false positives.</p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">3. Build Shareable Demos</span>
              <p className="text-xs text-stone-405 leading-relaxed">Every capstone is designed as a standalone portfolio item you can describe in recruiter discussions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values grid */}
      <section className="section-padding">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Our Core Values
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm">
            The principles that steer how we structure content and support learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { icon: Shield, title: 'Security First', desc: 'We teach ethical guidelines, compliance principles, and defensive designs in every tech workflow.' },
            { icon: Compass, title: 'Practical Relevance', desc: 'No outdated legacy systems. We audit our syllabus modules regularly to map modern tooling changes.' },
            { icon: Users, title: 'Supportive Growth', desc: 'We build structured resources, Q&A blocks, and support options to help you overcome blockers.' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl space-y-3 hover:border-amber-500/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-white">{item.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-tr from-[#0f0d0b] to-[#1e1305] text-white py-16 text-center border-t border-stone-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Join the Oxyfied Learning Platform
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto">
            Choose between Cybersecurity or Data Science core programs and start building your future today.
          </p>
          <Link to="/courses" className="btn-primary px-8 py-3 text-xs font-bold rounded-lg shadow inline-block">
            View Core Programs
          </Link>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Eye, Shield, Target, Users, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const About: React.FC = () => {
  return (
    <div className="bg-warm-ivory min-h-screen">
      <SEO 
        title="About Us" 
        description="Learn about Oxyfied's mission, learning philosophy, and core values centered on building practical tech capabilities."
        canonical="/about"
      />

      {/* Hero Header */}
      <section className="bg-warm-ivory py-20 text-center relative overflow-hidden border-b border-light-taupe">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,107,33,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            About Oxyfied
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Practical Skills. Real Projects. <span className="text-burnt-orange">Better Careers.</span>
          </h1>
          <p className="text-warm-gray text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We exist to close the gap between academic theory and real-world system requirements, empowering learners with hands-on, verifiable capabilities.
          </p>
        </div>
      </section>

      {/* Main Core Mission / Vision section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {/* Mission */}
        <div className="bg-warm-white border border-light-taupe p-8 rounded-2xl shadow-sm space-y-4 hover:border-burnt-orange/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold text-deep-navy">Our Mission</h2>
          <p className="text-sm text-warm-gray leading-relaxed">
            To provide technology enthusiasts and professionals with project-driven, highly practical pathways that build verifiable technological competencies. We avoid passive lecture formats, focusing instead on code outputs, system configurations, and real-world defensive practices.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-deep-navy">
            <CheckCircle2 className="w-4 h-4 text-sage-green" />
            <span>100% Project-Based Competency</span>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-warm-white border border-light-taupe p-8 rounded-2xl shadow-sm space-y-4 hover:border-burnt-orange/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-sage-green/15 border border-sage-green/30 flex items-center justify-center text-sage-green">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold text-deep-navy">Our Vision</h2>
          <p className="text-sm text-warm-gray leading-relaxed">
            To establish Oxyfied as the most reliable, hands-on technology learning environment, helping learners globally transition directly into cybersecurity operations, data science roles, and modern engineering functions.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-deep-navy">
            <CheckCircle2 className="w-4 h-4 text-sage-green" />
            <span>Global Industry Recognition</span>
          </div>
        </div>
      </section>

      {/* Philosophy section */}
      <section className="bg-warm-white border-y border-light-taupe py-20 text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
              Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
              Our Learning Philosophy
            </h2>
            <p className="text-warm-gray text-sm leading-relaxed max-w-2xl mx-auto">
              We believe the only way to build true engineering or security capability is to construct systems, analyze real errors, and harden infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
            <div className="bg-warm-ivory border border-light-taupe p-6 rounded-xl space-y-3">
              <span className="w-8 h-8 rounded-lg bg-burnt-orange text-white font-display font-bold text-sm flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-deep-navy">Focus on Code, Not Slides</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                We teach concepts through live terminals, interactive notebooks, and production architecture audits.
              </p>
            </div>

            <div className="bg-warm-ivory border border-light-taupe p-6 rounded-xl space-y-3">
              <span className="w-8 h-8 rounded-lg bg-deep-navy text-white font-display font-bold text-sm flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-deep-navy">Learn Defensive Hardening</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                Security is more than scanning; it is knowing how to patch directories, deploy firewalls, and audit access.
              </p>
            </div>

            <div className="bg-warm-ivory border border-light-taupe p-6 rounded-xl space-y-3">
              <span className="w-8 h-8 rounded-lg bg-sage-green text-white font-display font-bold text-sm flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-deep-navy">Build Shareable Demos</h3>
              <p className="text-xs text-warm-gray leading-relaxed">
                Every capstone is designed as a standalone portfolio project you can showcase during technical interviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-burnt-orange uppercase tracking-widest block">
            Guiding Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-deep-navy">
            Our Core Values
          </h2>
          <p className="text-warm-gray text-sm">
            The principles that steer how we structure content and support learners every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { 
              icon: Shield, 
              title: 'Security First', 
              desc: 'We teach ethical guidelines, compliance principles, and defensive designs in every single technical workflow.',
              badgeColor: 'bg-burnt-orange/10 text-burnt-orange border-burnt-orange/20'
            },
            { 
              icon: Compass, 
              title: 'Practical Relevance', 
              desc: 'No outdated legacy lessons. We audit our syllabus modules regularly to map modern industry tooling changes.',
              badgeColor: 'bg-deep-navy/10 text-deep-navy border-deep-navy/20'
            },
            { 
              icon: Users, 
              title: 'Supportive Growth', 
              desc: 'We build structured resources, Q&A blocks, and 1-on-1 mentor touchpoints to help you overcome roadblocks fast.',
              badgeColor: 'bg-sage-green/15 text-sage-green border-sage-green/30'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-warm-white border border-light-taupe p-7 rounded-2xl shadow-sm space-y-4 hover:border-burnt-orange/30 hover:shadow-md transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${item.badgeColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-deep-navy">{item.title}</h3>
                <p className="text-xs sm:text-sm text-warm-gray leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-deep-navy text-warm-white py-16 text-center border-t border-light-taupe relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(242,107,33,0.15),transparent_40%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/15 border border-burnt-orange/30 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Start Learning Today
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-warm-white">
            Join the Oxyfied Learning Platform
          </h2>
          <p className="text-warm-white/80 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Choose between Cybersecurity or Data Science core programs and start building your future career today.
          </p>
          <div className="pt-2">
            <Link to="/courses" className="btn-primary px-8 py-3 text-sm font-bold rounded-xl shadow-lg inline-flex items-center gap-2">
              View Core Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

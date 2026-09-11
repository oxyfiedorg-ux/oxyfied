import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, BookOpen, Tag } from 'lucide-react';
import { blogPosts } from '../../data/blog';
import { SEO } from '../../components/common/SEO';

// 1. Resources Index Page component (/resources)
export const Resources: React.FC = () => {
  return (
    <div className="bg-warm-ivory min-h-screen py-12">
      <SEO 
        title="Resources & Blog" 
        description="Access Oxyfied's directory of roadmap resources, engineering articles, and career pivot templates."
        canonical="/resources"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="text-left space-y-2 border-b border-light-taupe pb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-burnt-orange bg-burnt-orange/10 border border-burnt-orange/20 uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            Articles & Insights
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-deep-navy tracking-tight">
            Oxyfied <span className="text-burnt-orange">Resources</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm max-w-xl">
            Read roadmaps, technical cheat sheets, system design architectures, and career pivot strategies.
          </p>
        </div>

        {/* Featured Post Card */}
        {blogPosts.length > 0 && (
          <div className="bg-warm-white border border-light-taupe rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 hover:border-burnt-orange/30 transition-all">
            <div className="md:col-span-7 bg-soft-beige aspect-[16/10] md:aspect-auto">
              <img
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
              />
            </div>
            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-burnt-orange text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                  <Tag className="w-3 h-3" />
                  Featured Article
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy hover:text-burnt-orange transition-colors leading-tight">
                  <Link to={`/resources/${blogPosts[0].slug}`}>{blogPosts[0].title}</Link>
                </h2>
                <p className="text-warm-gray text-xs sm:text-sm leading-relaxed line-clamp-4">
                  {blogPosts[0].excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-light-taupe pt-4 text-xs font-medium text-warm-gray">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-burnt-orange" />
                  {blogPosts[0].date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sage-green" />
                  {blogPosts[0].readTime}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Articles list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <div
              key={post.id}
              className="bg-warm-white border border-light-taupe rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-burnt-orange/30 hover:shadow-md transition-all duration-300 text-left group"
            >
              <div className="aspect-[16/10] overflow-hidden bg-soft-beige">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-burnt-orange bg-burnt-orange/10 uppercase tracking-widest">
                    {post.category}
                  </span>
                  <h3 className="font-display font-bold text-base text-deep-navy group-hover:text-burnt-orange transition-colors line-clamp-2">
                    <Link to={`/resources/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-warm-gray text-xs leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-light-taupe text-[11px] text-warm-gray font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-burnt-orange" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sage-green" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// 2. Resource Details Dynamic View component (/resources/:slug)
export const ResourceDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-warm-ivory">
        <h2 className="text-xl font-bold text-deep-navy font-display">Article Not Found</h2>
        <Link to="/resources" className="btn-primary px-5 py-2.5 text-xs font-bold rounded-xl shadow">
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-warm-ivory min-h-screen py-12">
      <SEO 
        title={post.title} 
        description={post.excerpt} 
        canonical={`/resources/${post.slug}`} 
        ogImage={post.image}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        
        {/* Navigation & breadcrumb */}
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-gray hover:text-deep-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Link>

        {/* Article Meta Header */}
        <div className="space-y-4">
          <span className="px-3 py-1 bg-burnt-orange text-white text-xs font-bold rounded-lg uppercase tracking-wider inline-block">
            {post.category}
          </span>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-deep-navy leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-warm-gray font-medium border-y border-light-taupe py-3.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-burnt-orange" />
              {post.date}
            </span>
            <span className="text-light-taupe">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sage-green" />
              {post.readTime}
            </span>
          </div>
        </div>

        {/* Hero image */}
        <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-soft-beige shadow-sm border border-light-taupe">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="bg-warm-white border border-light-taupe p-6 sm:p-10 rounded-2xl shadow-sm space-y-5">
          {post.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('# ')) {
              return (
                <h2 key={index} className="text-xl sm:text-2xl font-display font-bold text-deep-navy pt-4 mb-2">
                  {trimmed.replace('# ', '')}
                </h2>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={index} className="text-lg font-display font-semibold text-deep-navy pt-3 mb-2">
                  {trimmed.replace('## ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('* ')) {
              return (
                <ul key={index} className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-warm-gray my-3">
                  {trimmed.split('\n').map((li, i) => (
                    <li key={i}>{li.replace('* ', '')}</li>
                  ))}
                </ul>
              );
            }
            if (trimmed.startsWith('`')) {
              return (
                <pre key={index} className="p-4 bg-deep-navy text-warm-white rounded-xl font-mono text-xs overflow-x-auto my-4 border border-light-taupe">
                  {trimmed.replace(/`/g, '')}
                </pre>
              );
            }
            return (
              <p key={index} className="text-xs sm:text-sm text-warm-gray leading-relaxed">
                {trimmed}
              </p>
            );
          })}

          {/* Author info block */}
          <div className="border-t border-light-taupe pt-8 flex items-center gap-4">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-light-taupe"
            />
            <div>
              <span className="text-sm font-bold text-deep-navy block">{post.author.name}</span>
              <span className="text-xs text-warm-gray block mt-0.5">{post.author.role}</span>
            </div>
          </div>
        </div>

      </article>
    </div>
  );
};

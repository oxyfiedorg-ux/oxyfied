import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Accordion } from '../../components/ui/Accordion';
import { SEO } from '../../components/common/SEO';

// Form validation schema using Zod
const contactSchema = zod.object({
  name: zod.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: zod.string().email({ message: 'Please enter a valid email address.' }),
  phone: zod.string().optional(),
  subject: zod.string().min(4, { message: 'Subject must be at least 4 characters.' }),
  message: zod.string().min(10, { message: 'Message must be at least 10 characters.' })
});

type ContactFormData = zod.infer<typeof contactSchema>;

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate API delivery delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Submitting support request:', data);
    setSubmitted(true);
    reset();
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const faqItems = [
    {
      id: 'faq-c1',
      title: 'Can I request corporate team training?',
      content: 'Yes! Oxyfied offers group registration rates and custom labs configurations for corporate technology teams. Please mention "Corporate Training" in the Subject field to route your request to our enterprise accounts department.'
    },
    {
      id: 'faq-c2',
      title: 'How do I request a refund?',
      content: 'We offer a 14-day refund window on all core tracks, provided you have completed less than 20% of the lessons and have not downloaded multiple course lab folders. Email support@Oxyfied.com directly to initiate a request.'
    },
    {
      id: 'faq-c3',
      title: 'How can I apply to become an instructor?',
      content: 'If you have over 5 years of production technology experience in cloud engineering, DevOps, data systems, or cybersecurity operations and a passion for project-based learning, email your resume to careers@Oxyfied.com.'
    }
  ].map((faq) => ({
    id: faq.id,
    title: faq.title,
    content: <p className="text-xs leading-relaxed text-stone-400">{faq.content}</p>
  }));

  return (
    <div className="bg-stone-950 min-h-screen">
      <SEO 
        title="Contact Support" 
        description="Get in touch with Oxyfied support, request enterprise training packages, or read through our enrollment FAQ directory."
        canonical="/contact"
      />
      {/* Contact Hero */}
      <section className="bg-[#0f0d0b] text-white py-16 text-center relative overflow-hidden border-b border-stone-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
            Support Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            How Can We Help You?
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Reach out for technical questions, enrollment help, or corporate training inquiries.
          </p>
        </div>
      </section>

      {/* Main Form & Contact Info layout (Grid: Form (7) vs Details (5)) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        
        {/* Form Panel (7 cols) */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-850 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-lg font-display font-bold text-white border-b border-stone-850 pb-3">
            Send Us a Message
          </h2>

          {submitted && (
            <div className="p-4 bg-emerald-955/20 border border-emerald-900/50 text-emerald-300 text-xs rounded-xl flex items-start gap-2.5 font-medium animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <span className="font-bold block text-white">Support Request Received!</span>
                <span>We have cataloged your ticket and will follow up via email within 24 hours.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field: Name */}
              <div className="space-y-1">
                <label htmlFor="contact-name" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                  Full Name
                </label>
                <input
                  type="text"
                  id="contact-name"
                  placeholder="e.g. John Doe"
                  {...register('name')}
                  className={`w-full px-3 py-2 bg-stone-950 border rounded-lg text-xs text-white focus:outline-none focus:bg-stone-950 transition-all ${
                    errors.name ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                  }`}
                />
                {errors.name && <span className="text-[10px] text-red-500 font-medium">{errors.name.message}</span>}
              </div>

              {/* Field: Email */}
              <div className="space-y-1">
                <label htmlFor="contact-email" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                  Email Address
                </label>
                <input
                  type="email"
                  id="contact-email"
                  placeholder="e.g. john@example.com"
                  {...register('email')}
                  className={`w-full px-3 py-2 bg-stone-950 border rounded-lg text-xs text-white focus:outline-none focus:bg-stone-950 transition-all ${
                    errors.email ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                  }`}
                />
                {errors.email && <span className="text-[10px] text-red-500 font-medium">{errors.email.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field: Phone */}
              <div className="space-y-1">
                <label htmlFor="contact-phone" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  id="contact-phone"
                  placeholder="e.g. +1 555-0100"
                  {...register('phone')}
                  className="w-full px-3 py-2 bg-stone-955 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-605 focus:outline-none focus:bg-stone-950 focus:border-amber-500 transition-all"
                />
              </div>

              {/* Field: Subject */}
              <div className="space-y-1">
                <label htmlFor="contact-subject" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                  Subject
                </label>
                <input
                  type="text"
                  id="contact-subject"
                  placeholder="e.g. Corporate Rates, Login Issues"
                  {...register('subject')}
                  className={`w-full px-3 py-2 bg-stone-950 border rounded-lg text-xs text-white focus:outline-none focus:bg-stone-950 transition-all ${
                    errors.subject ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                  }`}
                />
                {errors.subject && <span className="text-[10px] text-red-500 font-medium">{errors.subject.message}</span>}
              </div>
            </div>

            {/* Field: Message */}
            <div className="space-y-1">
              <label htmlFor="contact-message" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                Message Body
              </label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="Describe your request in detail..."
                {...register('message')}
                className={`w-full px-3 py-2 bg-stone-955 border rounded-lg text-xs text-white focus:outline-none focus:bg-stone-950 transition-all ${
                  errors.message ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                }`}
              />
              {errors.message && <span className="text-[10px] text-red-500 font-medium">{errors.message.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Info & FAQ Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Contacts details */}
          <div className="bg-[#141210] border border-stone-850 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-display font-bold text-base text-white border-b border-stone-850 pb-2">
              Contact Information
            </h3>
            
            <div className="space-y-4 text-xs text-stone-400">
              <div className="flex items-start gap-3">
                <Mail className="w-4.5 h-4.5 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">General Support</span>
                  <a href="mailto:support@Oxyfied.com" className="text-amber-400 hover:text-amber-300 hover:underline">support@Oxyfied.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4.5 h-4.5 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Phone Queries</span>
                  <span className="text-stone-400">+1 (555) 019-2844</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Corporate HQ</span>
                  <span className="text-stone-400">Oxyfied Technologies, 100 Pine St, San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQs */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-1.5 px-1">
              <HelpCircle className="w-5 h-5 text-stone-400" />
              Support FAQs
            </h3>
            <Accordion items={faqItems} allowMultiple={true} />
          </div>
        </div>

      </section>
    </div>
  );
};

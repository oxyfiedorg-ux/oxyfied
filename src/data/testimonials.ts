import type { Testimonial } from '../types';

export const testimonials: Testimonial[] = [
  {
    id: 't-1',
    name: 'Sarah Jenkins',
    role: 'Associate Security Analyst',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    content: 'The Cybersecurity Certificate Program at Oxyfied completely transformed my career path. The practical labs simulating active network intrusions taught me more than my college textbook ever did. Within two months of finishing, I landed my first job as a SOC analyst!',
    rating: 5,
    courseName: 'Cybersecurity Certificate Program'
  },
  {
    id: 't-2',
    name: 'Marcus Chen',
    role: 'Junior Data Scientist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    content: 'The Pandas, NumPy, and Scikit-Learn modules are exceptional. The projects used actual market datasets instead of neat toy examples. I really appreciated the focus on clean, logical Python practices and dataset formatting. Highly recommended for pivots!',
    rating: 5,
    courseName: 'Data Science Certificate Program'
  },
  {
    id: 't-3',
    name: 'Aisha Rahman',
    role: 'Systems Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    content: 'I already had some basic Linux background, but the ethical hacking, Web security, and vulnerability scanner labs filled massive gaps in my system administration workflow. Setting up Snort and performing scans made concepts incredibly concrete.',
    rating: 5,
    courseName: 'Cybersecurity Certificate Program'
  },
  {
    id: 't-4',
    name: 'David Kojo',
    role: 'Business Analytics Consultant',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    content: 'Learning SQL and Statistics in the Data Science track unlocked massive capabilities. The material is very well-paced, starting with clean, basic Python scripts and moving up to complex machine learning pipelines. The capstone project was a huge talking point in interviews.',
    rating: 4,
    courseName: 'Data Science Certificate Program'
  }
];

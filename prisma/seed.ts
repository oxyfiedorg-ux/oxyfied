import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  
  // Clean up all tables in order of dependency
  await prisma.homepageSetting.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.statItem.deleteMany({});
  await prisma.lessonProgress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.mentor.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding default users...');
  
  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('adminpassword123', 10);
  const studentPasswordHash = await bcrypt.hash('studentpassword123', 10);
  const mentor1PasswordHash = await bcrypt.hash('evelynpassword123', 10);
  const mentor2PasswordHash = await bcrypt.hash('michaelpassword123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@oxyfied.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+1 555-0100',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop'
    }
  });

  const student = await prisma.user.create({
    data: {
      name: 'Jane Student',
      email: 'student@oxyfied.com',
      passwordHash: studentPasswordHash,
      role: 'student',
      phone: '+1 555-0199',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
    }
  });

  const userMentor1 = await prisma.user.create({
    data: {
      name: 'Dr. Evelyn Vance',
      email: 'evelyn.vance@oxyfied.com',
      passwordHash: mentor1PasswordHash,
      role: 'mentor',
      phone: '+1 555-0201',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop'
    }
  });

  const userMentor2 = await prisma.user.create({
    data: {
      name: 'Michael Kovac',
      email: 'michael.kovac@oxyfied.com',
      passwordHash: mentor2PasswordHash,
      role: 'mentor',
      phone: '+1 555-0202',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop'
    }
  });

  console.log('Seeding mentors...');
  
  const inst1 = await prisma.mentor.create({
    data: {
      id: 'inst-1',
      userId: userMentor1.id,
      name: 'Dr. Evelyn Vance',
      designation: 'Lead Cybersecurity Instructor',
      bio: 'Former Enterprise Security Architect with 12+ years of experience auditing defense infrastructure. Holds certifications in CISSP, CEH, and OSCP. Passionate about teaching system hardening through practical, safe labs.',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
      email: 'evelyn.vance@oxyfied.com',
      expertise: ['Ethical Hacking', 'System Hardening', 'Vulnerability Assessment'],
      status: 'active',
      isActive: true
    }
  });

  const inst2 = await prisma.mentor.create({
    data: {
      id: 'inst-2',
      userId: userMentor2.id,
      name: 'Michael Kovac',
      designation: 'Principal Data Scientist & Researcher',
      bio: 'Data Science consultant previously leading optimization algorithms at finance platforms. Expert in statistical modeling, machine learning systems, and Python tooling. Dedicated to building production-ready analytical pipelines.',
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
      email: 'michael.kovac@oxyfied.com',
      expertise: ['Data Science', 'Machine Learning', 'Python'],
      status: 'active',
      isActive: true
    }
  });

  console.log('Seeding categories...');
  
  const catCyber = await prisma.category.create({
    data: { id: 'cat-cyber', name: 'Cybersecurity', slug: 'cybersecurity', description: 'Information security defense tracks', icon: 'Shield', sortOrder: 0 }
  });

  const catData = await prisma.category.create({
    data: { id: 'cat-data', name: 'Data Science', slug: 'data-science', description: 'Data analysis and predictive modeling', icon: 'TrendingUp', sortOrder: 1 }
  });

  const catAI = await prisma.category.create({
    data: { id: 'cat-ai', name: 'AI / ML', slug: 'ai-ml', description: 'Deep learning and Neural Networks', icon: 'Layers', sortOrder: 2 }
  });

  const catProg = await prisma.category.create({
    data: { id: 'cat-prog', name: 'Programming', slug: 'programming', description: 'Software engineering fundamentals', icon: 'BookOpen', sortOrder: 3 }
  });

  const catCloud = await prisma.category.create({
    data: { id: 'cat-cloud', name: 'Cloud Computing', slug: 'cloud-computing', description: 'Distributed systems architectures', icon: 'Cloud', sortOrder: 4 }
  });

  const catDevops = await prisma.category.create({
    data: { id: 'cat-devops', name: 'DevOps', slug: 'devops', description: 'Automation and CI/CD operations', icon: 'Cpu', sortOrder: 5 }
  });

  const catUI = await prisma.category.create({
    data: { id: 'cat-ui', name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interfaces and prototyping', icon: 'Figma', sortOrder: 6 }
  });

  const catMkt = await prisma.category.create({
    data: { id: 'cat-mkt', name: 'Digital Marketing', slug: 'digital-marketing', description: 'Growth hacking and analytics', icon: 'Award', sortOrder: 7 }
  });

  console.log('Seeding core courses...');

  // 1. Cybersecurity Course
  const courseCyber = await prisma.course.create({
    data: {
      id: 'cybersecurity',
      title: 'Cybersecurity Certificate Program',
      slug: 'cybersecurity',
      shortDescription: 'Build practical cybersecurity skills covering security fundamentals, ethical hacking, network security, vulnerability assessment, and real-world security practices.',
      description: 'Build practical cybersecurity skills covering security fundamentals, ethical hacking, network security, vulnerability assessment, and real-world security practices.',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
      categoryId: catCyber.id,
      mentorId: inst1.id,
      price: 199,
      discountPrice: 499,
      duration: '12 Weeks',
      level: 'Beginner to Advanced',
      status: 'available',
      isFeatured: true,
      isActive: true,
      skills: [
        'Ethical Hacking', 'Network Security', 'Vulnerability Assessment',
        'Linux Administration', 'Web Security', 'Security Operations (SOC)', 'Threat Analysis'
      ],
      requirements: [
        'Basic computer literacy and comfort with navigating operating systems.',
        'No prior programming or security experience is required (we start from scratch).',
        'A computer (Windows, macOS, or Linux) with at least 8GB of RAM.'
      ],
      whoIsItFor: [
        'Aspiring Cybersecurity Professionals and SOC Analysts.',
        'IT Professionals seeking to pivot into information security.',
        'Software developers looking to write secure code and understand system exploits.',
        'Tech enthusiasts wanting to build robust systems defense skills.'
      ]
    }
  });

  // 2. Data Science Course
  const courseData = await prisma.course.create({
    data: {
      id: 'data-science',
      title: 'Data Science Certificate Program',
      slug: 'data-science',
      shortDescription: 'Learn Python, statistics, data analysis, visualization, and machine learning through practical projects and real-world datasets.',
      description: 'Learn Python, statistics, data analysis, visualization, and machine learning through practical projects and real-world datasets.',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
      categoryId: catData.id,
      mentorId: inst2.id,
      price: 189,
      discountPrice: 449,
      duration: '10 Weeks',
      level: 'Beginner to Advanced',
      status: 'available',
      isFeatured: true,
      isActive: true,
      skills: [
        'Python Programming', 'Pandas & NumPy', 'Statistical Analysis',
        'Data Visualization', 'Machine Learning', 'SQL Databases', 'Scikit-Learn'
      ],
      requirements: [
        'Basic math foundations (algebra, basic probability).',
        'No programming background required; we start Python from the basics.',
        'A PC or Laptop (Windows/Mac/Linux) with an internet connection.'
      ],
      whoIsItFor: [
        'Aspiring Data Analysts and Data Scientists.',
        'Business analysts seeking to transition to programmatic tools.',
        'Developers hoping to integrate predictive data workflows into products.',
        'Anyone eager to extract actionable findings from raw spreadsheets.'
      ]
    }
  });

  console.log('Seeding upcoming courses...');
  
  const upcomingCourses = [
    {
      id: 'artificial-intelligence',
      title: 'Artificial Intelligence Mastery',
      slug: 'artificial-intelligence',
      shortDescription: 'Learn Neural Networks, Deep Learning, Natural Language Processing, and Generative AI from the ground up.',
      categoryId: catAI.id,
      mentorId: inst2.id,
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop',
      price: 0,
      discountPrice: 0,
      duration: '14 Weeks',
      level: 'Advanced',
      status: 'coming-soon',
      skills: ['Deep Learning', 'PyTorch', 'NLP', 'Computer Vision', 'Generative AI']
    },
    {
      id: 'fullstack-dev',
      title: 'Full Stack Web Development',
      slug: 'fullstack-dev',
      shortDescription: 'Master frontend and backend engineering using React.js, Node.js, Express, PostgreSQL, and modern dev tools.',
      categoryId: catProg.id,
      mentorId: inst1.id,
      thumbnail: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=600&auto=format&fit=crop',
      price: 0,
      discountPrice: 0,
      duration: '16 Weeks',
      level: 'Beginner to Advanced',
      status: 'coming-soon',
      skills: ['React.js', 'Node.js', 'PostgreSQL', 'REST APIs', 'WebSockets']
    },
    {
      id: 'cloud-computing',
      title: 'Cloud Solutions Architecture',
      slug: 'cloud-computing',
      shortDescription: 'Design and deploy scalable systems across cloud platforms, covering microservices, networking, and serverless architectures.',
      categoryId: catCloud.id,
      mentorId: inst1.id,
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
      price: 0,
      discountPrice: 0,
      duration: '10 Weeks',
      level: 'Intermediate to Advanced',
      status: 'coming-soon',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Serverless', 'Terraform']
    },
    {
      id: 'devops-engineering',
      title: 'DevOps & CI/CD Pipelines',
      slug: 'devops-engineering',
      shortDescription: 'Automate build pipelines, orchestrate deployments, and monitor infrastructure at scale using industry-standard tools.',
      categoryId: catDevops.id,
      mentorId: inst1.id,
      thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=600&auto=format&fit=crop',
      price: 0,
      discountPrice: 0,
      duration: '10 Weeks',
      level: 'Intermediate to Advanced',
      status: 'coming-soon',
      skills: ['Docker', 'CI/CD', 'GitHub Actions', 'Prometheus', 'Linux']
    },
    {
      id: 'ui-ux-design',
      title: 'UI/UX Product Design',
      slug: 'ui-ux-design',
      shortDescription: 'Master user research, wireframing, high-fidelity UI design, prototyping, and user testing with Figma.',
      categoryId: catUI.id,
      mentorId: inst1.id,
      thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=600&auto=format&fit=crop',
      price: 0,
      discountPrice: 0,
      duration: '8 Weeks',
      level: 'Beginner to Advanced',
      status: 'coming-soon',
      skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems']
    },
    {
      id: 'digital-marketing',
      title: 'Growth Marketing & Analytics',
      slug: 'digital-marketing',
      shortDescription: 'Learn SEO, SEM, content strategy, social media campaigns, and analytical tools to drive user growth.',
      categoryId: catMkt.id,
      mentorId: inst2.id,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
      price: 0,
      discountPrice: 0,
      duration: '6 Weeks',
      level: 'Beginner',
      status: 'coming-soon',
      skills: ['SEO', 'Google Analytics', 'A/B Testing', 'Content Marketing', 'Copywriting']
    }
  ];

  for (const c of upcomingCourses) {
    await prisma.course.create({
      data: {
        id: c.id,
        title: c.title,
        slug: c.slug,
        shortDescription: c.shortDescription,
        description: c.shortDescription,
        thumbnail: c.thumbnail,
        categoryId: c.categoryId,
        mentorId: c.mentorId,
        price: c.price,
        discountPrice: c.discountPrice,
        duration: c.duration,
        level: c.level,
        status: c.status,
        skills: c.skills,
        isFeatured: false,
        isActive: true
      }
    });
  }

  console.log('Seeding course modules & lessons...');

  // Cybersecurity modules & lessons
  const cybersecModules = [
    {
      id: 'cybersec-mod-1',
      title: 'Module 1 — Cybersecurity Fundamentals',
      description: 'Understand the security landscape, threat vectors, CIA Triad, and core security frameworks.',
      lessons: [
        { id: 'cs-l-1', title: '1.1 Introduction to the Course & Security Mindset', duration: '12:45', isPreview: true, youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-2', title: '1.2 Core Security Concepts: CIA Triad & AAA', duration: '15:20', isPreview: true, youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-3', title: '1.3 Understanding Modern Threat Actors & Attack Surfaces', duration: '18:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-4', title: '1.4 Cybersecurity Frameworks: NIST & ISO 27001', duration: '22:15', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'cybersec-mod-2',
      title: 'Module 2 — Networking Fundamentals',
      description: 'Learn the network layers, TCP/IP protocol suite, subnetting, and packet capture tools.',
      lessons: [
        { id: 'cs-l-5', title: '2.1 OSI Model vs TCP/IP Suite', duration: '14:30', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-6', title: '2.2 Understanding IP Addresses & Subnetting', duration: '25:40', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-7', title: '2.3 Common Network Protocols (DNS, DHCP, HTTP/S)', duration: '19:15', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-8', title: '2.4 Hands-on Packet Capture with Wireshark', duration: '31:50', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'cybersec-mod-3',
      title: 'Module 3 — Linux Fundamentals',
      description: 'Master the command line, filesystem structure, permission management, and bash scripting.',
      lessons: [
        { id: 'cs-l-9', title: '3.1 Navigating the Linux File System', duration: '16:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-10', title: '3.2 User Management & File Permissions (chmod/chown)', duration: '20:45', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-11', title: '3.3 Advanced Commands, Piping & Grep', duration: '22:30', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-12', title: '3.4 Practical Bash Scripting for Automation', duration: '28:15', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'cybersec-mod-4',
      title: 'Module 4 — Ethical Hacking',
      description: 'Phases of ethical hacking, scanning systems, active enumeration, and exploitation tools.',
      lessons: [
        { id: 'cs-l-13', title: '4.1 Methodology & Legal Aspects of Pen-Testing', duration: '13:50', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-14', title: '4.2 Port Scanning & OS Identification using Nmap', duration: '24:20', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-15', title: '4.3 Metasploit Framework: Exploiting Known Vulnerabilities', duration: '35:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-16', title: '4.4 Password Cracking & Social Engineering Basics', duration: '21:05', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'cybersec-mod-5',
      title: 'Module 5 — Web Application Security',
      description: 'Covering the OWASP Top 10 vulnerabilities including SQL Injection, XSS, and broken auth.',
      lessons: [
        { id: 'cs-l-17', title: '5.1 Introduction to Web Architecture & HTTP Requests', duration: '15:40', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-18', title: '5.2 SQL Injection (SQLi) - Theory & Hands-on Exploitation', duration: '29:30', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-19', title: '5.3 Cross-Site Scripting (XSS) Attacks & Defenses', duration: '22:15', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-20', title: '5.4 Securing API Endpoints & Session Management', duration: '19:40', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'cybersec-mod-6',
      title: 'Module 6 — Network Security',
      description: 'Firewall architectures, IDS/IPS tools, VPNs, and securing wireless networks.',
      lessons: [
        { id: 'cs-l-21', title: '6.1 Designing Firewalls (Stateful vs Stateless)', duration: '18:50', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-22', title: '6.2 Setting up Intrusion Detection Systems (Snort)', duration: '26:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-23', title: '6.3 Cryptography: Symmetric vs Asymmetric Encryption', duration: '24:30', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-24', title: '6.4 Virtual Private Networks (VPNs) & Tunneling Protocols', duration: '17:15', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'cybersec-mod-7',
      title: 'Module 7 — Vulnerability Assessment',
      description: 'Conduct scans, generate audits, prioritize remediation risks, and use tools like Nessus.',
      lessons: [
        { id: 'cs-l-25', title: '7.1 Vulnerability Lifecycle: Scan, Prioritize, Patch', duration: '14:20', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-26', title: '7.2 Setting up and Configuring Nessus Vulnerability Scanner', duration: '28:40', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-27', title: '7.3 Analyzing Vulnerability Reports & Verifying False Positives', duration: '21:30', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-28', title: '7.4 Remediation Planning and Patch Management Strategies', duration: '19:50', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'cybersec-mod-8',
      title: 'Module 8 — Security Operations',
      description: 'Security information and event management (SIEM), logs analysis, incident response.',
      lessons: [
        { id: 'cs-l-29', title: '8.1 Inside the SOC: Roles, Workflows & Tools', duration: '16:40', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-30', title: '8.2 Introduction to SIEM: Monitoring with Splunk', duration: '33:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-31', title: '8.3 Analyzing Web Server & Firewall Authentication Logs', duration: '22:15', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-32', title: '8.4 Playbooks: Incident Response Phases (NIST Guidelines)', duration: '25:30', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'cybersec-mod-9',
      title: 'Module 9 — Practical Security Labs',
      description: 'Hands-on target exercises, defensive hardening, and security operations simulations.',
      lessons: [
        { id: 'cs-l-33', title: '9.1 Lab: Hardening a Linux Server Infrastructure', duration: '34:20', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-34', title: '9.2 Lab: Hardening a Windows Domain Controller', duration: '31:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-35', title: '9.3 Lab: Active Incident Response on a Compromised Host', duration: '38:40', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'cybersec-mod-10',
      title: 'Module 10 — Capstone Project',
      description: 'Conduct a full pentest and construct a comprehensive defensive architecture audit report.',
      lessons: [
        { id: 'cs-l-36', title: '10.1 Capstone Project Briefing & Environment Setup', duration: '12:15', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-37', title: '10.2 Performing the Pentest Assessment', duration: '45:00', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-38', title: '10.3 Formulating the Technical Defense Audit Report', duration: '30:00', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'cs-l-39', title: '10.4 Final Project Submission & Presentation Tips', duration: '15:20', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    }
  ];

  for (let mIdx = 0; mIdx < cybersecModules.length; mIdx++) {
    const modData = cybersecModules[mIdx];
    const mod = await prisma.module.create({
      data: {
        id: modData.id,
        courseId: courseCyber.id,
        title: modData.title,
        description: modData.description,
        sortOrder: mIdx
      }
    });

    for (let lIdx = 0; lIdx < modData.lessons.length; lIdx++) {
      const l = modData.lessons[lIdx];
      await prisma.lesson.create({
        data: {
          id: l.id,
          moduleId: mod.id,
          courseId: courseCyber.id,
          title: l.title,
          duration: l.duration,
          isPreview: l.isPreview || false,
          youtubeVideoId: l.youtubeVideoId,
          videoType: 'youtube',
          sortOrder: lIdx
        }
      });
    }
  }

  // Data Science modules & lessons
  const dataScienceModules = [
    {
      id: 'ds-mod-1',
      title: 'Module 1 — Introduction to Data Science',
      description: 'What is data science? Setting up Anaconda, Jupyter Notebooks, and project workflows.',
      lessons: [
        { id: 'ds-l-1', title: '1.1 Data Science Industry Landscape & Roles', duration: '10:15', isPreview: true, youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-2', title: '1.2 Installing Anaconda & Navigating Jupyter Notebooks', duration: '16:45', isPreview: true, youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-3', title: '1.3 Git & GitHub for Data Science Collaboration', duration: '14:20', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'ds-mod-2',
      title: 'Module 2 — Python Programming',
      description: 'Python syntax, variables, lists, dictionaries, conditionals, loops, and functions.',
      lessons: [
        { id: 'ds-l-4', title: '2.1 Python Variables, Strings, and Numeric Operations', duration: '18:30', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-5', title: '2.2 Collections: Lists, Tuples, Dictionaries, and Sets', duration: '22:15', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-6', title: '2.3 Control Flows: If-statements, For & While Loops', duration: '20:45', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-7', title: '2.4 Writing Custom Functions & Error Handling', duration: '26:10', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'ds-mod-3',
      title: 'Module 3 — NumPy and Pandas',
      description: 'Vectorized computing with NumPy and structuring tabular data using Pandas DataFrames.',
      lessons: [
        { id: 'ds-l-8', title: '3.1 NumPy Arrays: Vectors, Matrices & Indexing', duration: '19:40', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-9', title: '3.2 Introduction to Pandas: Series and DataFrames', duration: '22:55', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-10', title: '3.3 Selecting, Filtering, and Sorting DataFrames', duration: '25:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-11', title: '3.4 Aggregation & Grouping Operations (groupby)', duration: '24:35', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'ds-mod-4',
      title: 'Module 4 — Data Cleaning',
      description: 'Handling missing values, duplicate entries, data type formatting, and string manipulation.',
      lessons: [
        { id: 'ds-l-12', title: '4.1 Identifying & imputing missing data (dropna/fillna)', duration: '18:50', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-13', title: '4.2 Detecting & removing duplicate entries', duration: '12:15', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-14', title: '4.3 Converting data types & parsing datetime formats', duration: '20:30', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-15', title: '4.4 Merging & joining multiple DataFrames', duration: '23:45', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'ds-mod-5',
      title: 'Module 5 — Data Visualization',
      description: 'Plotting variables using Matplotlib and styling visual analyses using Seaborn.',
      lessons: [
        { id: 'ds-l-16', title: '5.1 Plotting Basics: Line, Bar, and Scatter Plots', duration: '17:15', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-17', title: '5.2 Distribution Plots: Histograms, Box plots, and KDEs', duration: '19:40', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-18', title: '5.3 Multi-variable Plots: Pairplots & Heatmaps with Seaborn', duration: '21:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-19', title: '5.4 Customizing Charts: Labels, Legends, Themes, and Layouts', duration: '22:50', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'ds-mod-6',
      title: 'Module 6 — Statistics',
      description: 'Probability, descriptive statistics, distributions, and hypothesis testing.',
      lessons: [
        { id: 'ds-l-20', title: '6.1 Mean, Median, Mode, Variance, and Standard Deviation', duration: '15:20', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-21', title: '6.2 Standard Normal Distribution & Z-Scores', duration: '18:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-22', title: '6.3 Central Limit Theorem (CLT) & Confidence Intervals', duration: '22:45', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-23', title: '6.4 Hypothesis Testing: T-tests, ANOVA & P-values', duration: '29:30', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'ds-mod-7',
      title: 'Module 7 — Machine Learning',
      description: 'Supervised learning, linear and logistic regression, decision trees, and clustering.',
      lessons: [
        { id: 'ds-l-24', title: '7.1 Machine Learning Landscape: Supervised vs Unsupervised', duration: '14:15', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-25', title: '7.2 Linear Regression: Math & Scikit-Learn API', duration: '27:50', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-26', title: '7.3 Classification: Logistic Regression & K-Nearest Neighbors', duration: '25:20', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-27', title: '7.4 Non-linear Models: Decision Trees & Random Forests', duration: '31:40', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'ds-mod-8',
      title: 'Module 8 — Model Evaluation',
      description: 'Overfitting vs underfitting, cross-validation, hyperparameter tuning, metrics.',
      lessons: [
        { id: 'ds-l-28', title: '8.1 Training vs Test Split & Cross-Validation', duration: '19:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-29', title: '8.2 Classification Metrics: Precision, Recall, F1 & ROC-AUC', duration: '26:30', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-30', title: '8.3 Regression Metrics: MAE, MSE, and R-Squared', duration: '18:45', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-31', title: '8.4 Hyperparameter Optimization: Grid & Random Search', duration: '28:10', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'ds-mod-9',
      title: 'Module 9 — Real-World Projects',
      description: 'Case studies mapping predictions to business operations datasets.',
      lessons: [
        { id: 'ds-l-32', title: '9.1 Project: Predicting Customer Churn (Telecom Industry)', duration: '33:45', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-33', title: '9.2 Project: Time Series Forecasting of E-Commerce Sales', duration: '36:20', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-34', title: '9.3 Project: Clustering Customer Segments (Marketing Analytics)', duration: '30:15', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    },
    {
      id: 'ds-mod-10',
      title: 'Module 10 — Capstone Project',
      description: 'Perform a full end-to-end data pipeline: ingestion, cleaning, EDA, modeling, and dashboarding.',
      lessons: [
        { id: 'ds-l-35', title: '10.1 Capstone Project Overview & Dataset Selection', duration: '14:20', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-36', title: '10.2 Performing Ingestion, Cleaning & Advanced EDA', duration: '41:10', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-37', title: '10.3 Training, Validating, and Tuning the ML Pipeline', duration: '38:50', youtubeVideoId: 'dQw4w9WgXcQ' },
        { id: 'ds-l-38', title: '10.4 Building an Interactive Visual Dashboard using Streamlit', duration: '32:15', youtubeVideoId: 'dQw4w9WgXcQ' }
      ]
    }
  ];

  for (let mIdx = 0; mIdx < dataScienceModules.length; mIdx++) {
    const modData = dataScienceModules[mIdx];
    const mod = await prisma.module.create({
      data: {
        id: modData.id,
        courseId: courseData.id,
        title: modData.title,
        description: modData.description,
        sortOrder: mIdx
      }
    });

    for (let lIdx = 0; lIdx < modData.lessons.length; lIdx++) {
      const l = modData.lessons[lIdx];
      await prisma.lesson.create({
        data: {
          id: l.id,
          moduleId: mod.id,
          courseId: courseData.id,
          title: l.title,
          duration: l.duration,
          isPreview: l.isPreview || false,
          youtubeVideoId: l.youtubeVideoId,
          videoType: 'youtube',
          sortOrder: lIdx
        }
      });
    }
  }

  // Enroll default student in Cybersecurity for demo continuity
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: courseCyber.id,
      status: 'active',
      progress: 5
    }
  });

  // Add default completed progress lessons for student
  await prisma.lessonProgress.createMany({
    data: [
      { userId: student.id, courseId: courseCyber.id, lessonId: 'cs-l-1' },
      { userId: student.id, courseId: courseCyber.id, lessonId: 'cs-l-2' }
    ]
  });

  console.log('Seeding activity logs...');
  await prisma.activityLog.createMany({
    data: [
      { action: 'USER_REGISTER', details: 'Jane Student registered as a new student.' },
      { action: 'MENTOR_CREATED', details: 'Dr. Evelyn Vance was added as a mentor.' },
      { action: 'MENTOR_CREATED', details: 'Michael Kovac was added as a mentor.' },
      { action: 'COURSE_CREATE', details: 'Course "Cybersecurity Certificate Program" was created.' },
      { action: 'COURSE_CREATE', details: 'Course "Data Science Certificate Program" was created.' },
      { action: 'COURSE_ENROLL', details: 'Jane Student enrolled in Cybersecurity Certificate Program.' }
    ]
  });

  console.log('Seeding statistics...');
  
  await prisma.statItem.createMany({
    data: [
      { id: 'learners', value: '2,500+', label: 'Active Learners', icon: 'Users', sortOrder: 0 },
      { id: 'courses', value: '2 Live Programs', label: 'Industry-Focused Core Tracks', icon: 'BookOpen', sortOrder: 1 },
      { id: 'projects', value: '15+ Labs', label: 'Real-World Projects Built', icon: 'FolderGit', sortOrder: 2 },
      { id: 'rating', value: '4.8 / 5.0', label: 'Average Student Rating', icon: 'Star', sortOrder: 3 }
    ]
  });

  console.log('Seeding testimonials...');
  
  await prisma.testimonial.createMany({
    data: [
      {
        id: 't-1',
        name: 'Alexander P.',
        role: 'SOC Analyst & Network Defender',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
        content: 'I already had some basic Linux background, but the ethical hacking, Web security, and vulnerability scanner labs filled massive gaps in my system administration workflow. Setting up Snort and performing scans made concepts incredibly concrete.',
        rating: 5,
        courseName: 'Cybersecurity Certificate Program'
      },
      {
        id: 't-2',
        name: 'Meera S.',
        role: 'Junior Data Scientist',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
        content: 'The Python, Pandas, and machine learning segments took me from spreadsheets to scripts. The instructors focused heavily on practical execution, and building regression and classification pipelines helped me clear my technical interviews.',
        rating: 5,
        courseName: 'Data Science Certificate Program'
      }
    ]
  });

  console.log('Seeding homepage settings...');
  
  await prisma.homepageSetting.createMany({
    data: [
      { key: 'heroTitle', value: 'Learn the skills that make you useful.' },
      { key: 'heroSubtitle', value: 'Practical technology education' },
      { key: 'heroDescription', value: 'Build confident, career-ready ability in cybersecurity and data science through focused lessons, hands-on labs, and projects worth showing.' }
    ]
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

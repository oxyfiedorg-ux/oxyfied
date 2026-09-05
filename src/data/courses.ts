import type { Course } from '../types';

export const courses: Course[] = [
  {
    id: 'cybersecurity',
    slug: 'cybersecurity',
    title: 'Cybersecurity Certificate Program',
    category: 'Cybersecurity',
    description: 'Build practical cybersecurity skills covering security fundamentals, ethical hacking, network security, vulnerability assessment, and real-world security practices.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    price: 199,
    originalPrice: 499,
    duration: '12 Weeks',
    lessons: 45,
    level: 'Beginner to Advanced',
    rating: 4.8,
    students: 1250,
    status: 'available',
    featured: true,
    skills: [
      'Ethical Hacking',
      'Network Security',
      'Vulnerability Assessment',
      'Linux Administration',
      'Web Security',
      'Security Operations (SOC)',
      'Threat Analysis'
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
    ],
    modules: [
      {
        id: 'cybersec-mod-1',
        title: 'Module 1 — Cybersecurity Fundamentals',
        description: 'Understand the security landscape, threat vectors, CIA Triad, and core security frameworks.',
        lessons: [
          { id: 'cs-l-1', title: '1.1 Introduction to the Course & Security Mindset', duration: '12:45', isPreview: true },
          { id: 'cs-l-2', title: '1.2 Core Security Concepts: CIA Triad & AAA', duration: '15:20', isPreview: true },
          { id: 'cs-l-3', title: '1.3 Understanding Modern Threat Actors & Attack Surfaces', duration: '18:10' },
          { id: 'cs-l-4', title: '1.4 Cybersecurity Frameworks: NIST & ISO 27001', duration: '22:15' }
        ]
      },
      {
        id: 'cybersec-mod-2',
        title: 'Module 2 — Networking Fundamentals',
        description: 'Learn the network layers, TCP/IP protocol suite, subnetting, and packet capture tools.',
        lessons: [
          { id: 'cs-l-5', title: '2.1 OSI Model vs TCP/IP Suite', duration: '14:30' },
          { id: 'cs-l-6', title: '2.2 Understanding IP Addresses & Subnetting', duration: '25:40' },
          { id: 'cs-l-7', title: '2.3 Common Network Protocols (DNS, DHCP, HTTP/S)', duration: '19:15' },
          { id: 'cs-l-8', title: '2.4 Hands-on Packet Capture with Wireshark', duration: '31:50' }
        ]
      },
      {
        id: 'cybersec-mod-3',
        title: 'Module 3 — Linux Fundamentals',
        description: 'Master the command line, filesystem structure, permission management, and bash scripting.',
        lessons: [
          { id: 'cs-l-9', title: '3.1 Navigating the Linux File System', duration: '16:10' },
          { id: 'cs-l-10', title: '3.2 User Management & File Permissions (chmod/chown)', duration: '20:45' },
          { id: 'cs-l-11', title: '3.3 Advanced Commands, Piping & Grep', duration: '22:30' },
          { id: 'cs-l-12', title: '3.4 Practical Bash Scripting for Automation', duration: '28:15' }
        ]
      },
      {
        id: 'cybersec-mod-4',
        title: 'Module 4 — Ethical Hacking',
        description: 'Phases of ethical hacking, scanning systems, active enumeration, and exploitation tools.',
        lessons: [
          { id: 'cs-l-13', title: '4.1 Methodology & Legal Aspects of Pen-Testing', duration: '13:50' },
          { id: 'cs-l-14', title: '4.2 Port Scanning & OS Identification using Nmap', duration: '24:20' },
          { id: 'cs-l-15', title: '4.3 Metasploit Framework: Exploiting Known Vulnerabilities', duration: '35:10' },
          { id: 'cs-l-16', title: '4.4 Password Cracking & Social Engineering Basics', duration: '21:05' }
        ]
      },
      {
        id: 'cybersec-mod-5',
        title: 'Module 5 — Web Application Security',
        description: 'Covering the OWASP Top 10 vulnerabilities including SQL Injection, XSS, and broken auth.',
        lessons: [
          { id: 'cs-l-17', title: '5.1 Introduction to Web Architecture & HTTP Requests', duration: '15:40' },
          { id: 'cs-l-18', title: '5.2 SQL Injection (SQLi) - Theory & Hands-on Exploitation', duration: '29:30' },
          { id: 'cs-l-19', title: '5.3 Cross-Site Scripting (XSS) Attacks & Defenses', duration: '22:15' },
          { id: 'cs-l-20', title: '5.4 Securing API Endpoints & Session Management', duration: '19:40' }
        ]
      },
      {
        id: 'cybersec-mod-6',
        title: 'Module 6 — Network Security',
        description: 'Firewall architectures, IDS/IPS tools, VPNs, and securing wireless networks.',
        lessons: [
          { id: 'cs-l-21', title: '6.1 Designing Firewalls (Stateful vs Stateless)', duration: '18:50' },
          { id: 'cs-l-22', title: '6.2 Setting up Intrusion Detection Systems (Snort)', duration: '26:10' },
          { id: 'cs-l-23', title: '6.3 Cryptography: Symmetric vs Asymmetric Encryption', duration: '24:30' },
          { id: 'cs-l-24', title: '6.4 Virtual Private Networks (VPNs) & Tunneling Protocols', duration: '17:15' }
        ]
      },
      {
        id: 'cybersec-mod-7',
        title: 'Module 7 — Vulnerability Assessment',
        description: 'Conduct scans, generate audits, prioritize remediation risks, and use tools like Nessus.',
        lessons: [
          { id: 'cs-l-25', title: '7.1 Vulnerability Lifecycle: Scan, Prioritize, Patch', duration: '14:20' },
          { id: 'cs-l-26', title: '7.2 Setting up and Configuring Nessus Vulnerability Scanner', duration: '28:40' },
          { id: 'cs-l-27', title: '7.3 Analyzing Vulnerability Reports & Verifying False Positives', duration: '21:30' },
          { id: 'cs-l-28', title: '7.4 Remediation Planning and Patch Management Strategies', duration: '19:50' }
        ]
      },
      {
        id: 'cybersec-mod-8',
        title: 'Module 8 — Security Operations',
        description: 'Security information and event management (SIEM), logs analysis, incident response.',
        lessons: [
          { id: 'cs-l-29', title: '8.1 Inside the SOC: Roles, Workflows & Tools', duration: '16:40' },
          { id: 'cs-l-30', title: '8.2 Introduction to SIEM: Monitoring with Splunk', duration: '33:10' },
          { id: 'cs-l-31', title: '8.3 Analyzing Web Server & Firewall Authentication Logs', duration: '22:15' },
          { id: 'cs-l-32', title: '8.4 Playbooks: Incident Response Phases (NIST Guidelines)', duration: '25:30' }
        ]
      },
      {
        id: 'cybersec-mod-9',
        title: 'Module 9 — Practical Security Labs',
        description: 'Hands-on target exercises, defensive hardening, and security operations simulations.',
        lessons: [
          { id: 'cs-l-33', title: '9.1 Lab: Hardening a Linux Server Infrastructure', duration: '34:20' },
          { id: 'cs-l-34', title: '9.2 Lab: Hardening a Windows Domain Controller', duration: '31:10' },
          { id: 'cs-l-35', title: '9.3 Lab: Active Incident Response on a Compromised Host', duration: '38:40' }
        ]
      },
      {
        id: 'cybersec-mod-10',
        title: 'Module 10 — Capstone Project',
        description: 'Conduct a full pentest and construct a comprehensive defensive architecture audit report.',
        lessons: [
          { id: 'cs-l-36', title: '10.1 Capstone Project Briefing & Environment Setup', duration: '12:15' },
          { id: 'cs-l-37', title: '10.2 Performing the Pentest Assessment', duration: '45:00' },
          { id: 'cs-l-38', title: '10.3 Formulating the Technical Defense Audit Report', duration: '30:00' },
          { id: 'cs-l-39', title: '10.4 Final Project Submission & Presentation Tips', duration: '15:20' }
        ]
      }
    ]
  },
  {
    id: 'data-science',
    slug: 'data-science',
    title: 'Data Science Certificate Program',
    category: 'Data Science',
    description: 'Learn Python, statistics, data analysis, visualization, and machine learning through practical projects and real-world datasets.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    price: 189,
    originalPrice: 449,
    duration: '10 Weeks',
    lessons: 40,
    level: 'Beginner to Advanced',
    rating: 4.7,
    students: 980,
    status: 'available',
    featured: true,
    skills: [
      'Python Programming',
      'Pandas & NumPy',
      'Statistical Analysis',
      'Data Visualization',
      'Machine Learning',
      'SQL Databases',
      'Scikit-Learn'
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
    ],
    modules: [
      {
        id: 'ds-mod-1',
        title: 'Module 1 — Introduction to Data Science',
        description: 'What is data science? Setting up Anaconda, Jupyter Notebooks, and project workflows.',
        lessons: [
          { id: 'ds-l-1', title: '1.1 Data Science Industry Landscape & Roles', duration: '10:15', isPreview: true },
          { id: 'ds-l-2', title: '1.2 Installing Anaconda & Navigating Jupyter Notebooks', duration: '16:45', isPreview: true },
          { id: 'ds-l-3', title: '1.3 Git & GitHub for Data Science Collaboration', duration: '14:20' }
        ]
      },
      {
        id: 'ds-mod-2',
        title: 'Module 2 — Python Programming',
        description: 'Python syntax, variables, lists, dictionaries, conditionals, loops, and functions.',
        lessons: [
          { id: 'ds-l-4', title: '2.1 Python Variables, Strings, and Numeric Operations', duration: '18:30' },
          { id: 'ds-l-5', title: '2.2 Collections: Lists, Tuples, Dictionaries, and Sets', duration: '22:15' },
          { id: 'ds-l-6', title: '2.3 Control Flows: If-statements, For & While Loops', duration: '20:45' },
          { id: 'ds-l-7', title: '2.4 Writing Custom Functions & Error Handling', duration: '26:10' }
        ]
      },
      {
        id: 'ds-mod-3',
        title: 'Module 3 — NumPy and Pandas',
        description: 'Vectorized computing with NumPy and structuring tabular data using Pandas DataFrames.',
        lessons: [
          { id: 'ds-l-8', title: '3.1 NumPy Arrays: Vectors, Matrices & Indexing', duration: '19:40' },
          { id: 'ds-l-9', title: '3.2 Introduction to Pandas: Series and DataFrames', duration: '22:55' },
          { id: 'ds-l-10', title: '3.3 Selecting, Filtering, and Sorting DataFrames', duration: '25:10' },
          { id: 'ds-l-11', title: '3.4 Aggregation & Grouping Operations (groupby)', duration: '24:35' }
        ]
      },
      {
        id: 'ds-mod-4',
        title: 'Module 4 — Data Cleaning',
        description: 'Handling missing values, duplicate entries, data type formatting, and string manipulation.',
        lessons: [
          { id: 'ds-l-12', title: '4.1 Identifying & imputing missing data (dropna/fillna)', duration: '18:50' },
          { id: 'ds-l-13', title: '4.2 Detecting & removing duplicate entries', duration: '12:15' },
          { id: 'ds-l-14', title: '4.3 Converting data types & parsing datetime formats', duration: '20:30' },
          { id: 'ds-l-15', title: '4.4 Merging & joining multiple DataFrames', duration: '23:45' }
        ]
      },
      {
        id: 'ds-mod-5',
        title: 'Module 5 — Data Visualization',
        description: 'Plotting variables using Matplotlib and styling visual analyses using Seaborn.',
        lessons: [
          { id: 'ds-l-16', title: '5.1 Plotting Basics: Line, Bar, and Scatter Plots', duration: '17:15' },
          { id: 'ds-l-17', title: '5.2 Distribution Plots: Histograms, Box plots, and KDEs', duration: '19:40' },
          { id: 'ds-l-18', title: '5.3 Multi-variable Plots: Pairplots & Heatmaps with Seaborn', duration: '21:10' },
          { id: 'ds-l-19', title: '5.4 Customizing Charts: Labels, Legends, Themes, and Layouts', duration: '22:50' }
        ]
      },
      {
        id: 'ds-mod-6',
        title: 'Module 6 — Statistics',
        description: 'Probability, descriptive statistics, distributions, and hypothesis testing.',
        lessons: [
          { id: 'ds-l-20', title: '6.1 Mean, Median, Mode, Variance, and Standard Deviation', duration: '15:20' },
          { id: 'ds-l-21', title: '6.2 Standard Normal Distribution & Z-Scores', duration: '18:10' },
          { id: 'ds-l-22', title: '6.3 Central Limit Theorem (CLT) & Confidence Intervals', duration: '22:45' },
          { id: 'ds-l-23', title: '6.4 Hypothesis Testing: T-tests, ANOVA & P-values', duration: '29:30' }
        ]
      },
      {
        id: 'ds-mod-7',
        title: 'Module 7 — Machine Learning',
        description: 'Supervised learning, linear and logistic regression, decision trees, and clustering.',
        lessons: [
          { id: 'ds-l-24', title: '7.1 Machine Learning Landscape: Supervised vs Unsupervised', duration: '14:15' },
          { id: 'ds-l-25', title: '7.2 Linear Regression: Math & Scikit-Learn API', duration: '27:50' },
          { id: 'ds-l-26', title: '7.3 Classification: Logistic Regression & K-Nearest Neighbors', duration: '25:20' },
          { id: 'ds-l-27', title: '7.4 Non-linear Models: Decision Trees & Random Forests', duration: '31:40' }
        ]
      },
      {
        id: 'ds-mod-8',
        title: 'Module 8 — Model Evaluation',
        description: 'Overfitting vs underfitting, cross-validation, hyperparameter tuning, metrics.',
        lessons: [
          { id: 'ds-l-28', title: '8.1 Training vs Test Split & Cross-Validation', duration: '19:10' },
          { id: 'ds-l-29', title: '8.2 Classification Metrics: Precision, Recall, F1 & ROC-AUC', duration: '26:30' },
          { id: 'ds-l-30', title: '8.3 Regression Metrics: MAE, MSE, and R-Squared', duration: '18:45' },
          { id: 'ds-l-31', title: '8.4 Hyperparameter Optimization: Grid & Random Search', duration: '28:10' }
        ]
      },
      {
        id: 'ds-mod-9',
        title: 'Module 9 — Real-World Projects',
        description: 'Case studies mapping predictions to business operations datasets.',
        lessons: [
          { id: 'ds-l-32', title: '9.1 Project: Predicting Customer Churn (Telecom Industry)', duration: '33:45' },
          { id: 'ds-l-33', title: '9.2 Project: Time Series Forecasting of E-Commerce Sales', duration: '36:20' },
          { id: 'ds-l-34', title: '9.3 Project: Clustering Customer Segments (Marketing Analytics)', duration: '30:15' }
        ]
      },
      {
        id: 'ds-mod-10',
        title: 'Module 10 — Capstone Project',
        description: 'Perform a full end-to-end data pipeline: ingestion, cleaning, EDA, modeling, and dashboarding.',
        lessons: [
          { id: 'ds-l-35', title: '10.1 Capstone Project Overview & Dataset Selection', duration: '14:20' },
          { id: 'ds-l-36', title: '10.2 Performing Ingestion, Cleaning & Advanced EDA', duration: '41:10' },
          { id: 'ds-l-37', title: '10.3 Training, Validating, and Tuning the ML Pipeline', duration: '38:50' },
          { id: 'ds-l-38', title: '10.4 Building an Interactive Visual Dashboard using Streamlit', duration: '32:15' }
        ]
      }
    ]
  },
  
  // Coming Soon courses
  {
    id: 'artificial-intelligence',
    slug: 'artificial-intelligence',
    title: 'Artificial Intelligence Mastery',
    category: 'AI / ML',
    description: 'Learn Neural Networks, Deep Learning, Natural Language Processing, and Generative AI from the ground up.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop',
    price: 0,
    originalPrice: 0,
    duration: '14 Weeks',
    lessons: 50,
    level: 'Advanced',
    rating: 0,
    students: 0,
    status: 'coming-soon',
    featured: false,
    skills: ['Deep Learning', 'PyTorch', 'NLP', 'Computer Vision', 'Generative AI']
  },
  {
    id: 'fullstack-dev',
    slug: 'fullstack-dev',
    title: 'Full Stack Web Development',
    category: 'Programming',
    description: 'Master frontend and backend engineering using React.js, Node.js, Express, PostgreSQL, and modern dev tools.',
    image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=600&auto=format&fit=crop',
    price: 0,
    originalPrice: 0,
    duration: '16 Weeks',
    lessons: 65,
    level: 'Beginner to Advanced',
    rating: 0,
    students: 0,
    status: 'coming-soon',
    featured: false,
    skills: ['React.js', 'Node.js', 'PostgreSQL', 'REST APIs', 'WebSockets']
  },
  {
    id: 'cloud-computing',
    slug: 'cloud-computing',
    title: 'Cloud Solutions Architecture',
    category: 'Cloud Computing',
    description: 'Design and deploy scalable systems across cloud platforms, covering microservices, networking, and serverless architectures.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    price: 0,
    originalPrice: 0,
    duration: '10 Weeks',
    lessons: 38,
    level: 'Intermediate to Advanced',
    rating: 0,
    students: 0,
    status: 'coming-soon',
    featured: false,
    skills: ['AWS', 'Docker', 'Kubernetes', 'Serverless', 'Terraform']
  },
  {
    id: 'devops-engineering',
    slug: 'devops-engineering',
    title: 'DevOps & CI/CD Pipelines',
    category: 'DevOps',
    description: 'Automate build pipelines, orchestrate deployments, and monitor infrastructure at scale using industry-standard tools.',
    image: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=600&auto=format&fit=crop',
    price: 0,
    originalPrice: 0,
    duration: '10 Weeks',
    lessons: 40,
    level: 'Intermediate to Advanced',
    rating: 0,
    students: 0,
    status: 'coming-soon',
    featured: false,
    skills: ['Docker', 'CI/CD', 'GitHub Actions', 'Prometheus', 'Linux']
  },
  {
    id: 'ui-ux-design',
    slug: 'ui-ux-design',
    title: 'UI/UX Product Design',
    category: 'UI/UX Design',
    description: 'Master user research, wireframing, high-fidelity UI design, prototyping, and user testing with Figma.',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=600&auto=format&fit=crop',
    price: 0,
    originalPrice: 0,
    duration: '8 Weeks',
    lessons: 32,
    level: 'Beginner to Advanced',
    rating: 0,
    students: 0,
    status: 'coming-soon',
    featured: false,
    skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems']
  },
  {
    id: 'digital-marketing',
    slug: 'digital-marketing',
    title: 'Growth Marketing & Analytics',
    category: 'Digital Marketing',
    description: 'Learn SEO, SEM, content strategy, social media campaigns, and analytical tools to drive user growth.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
    price: 0,
    originalPrice: 0,
    duration: '6 Weeks',
    lessons: 25,
    level: 'Beginner',
    rating: 0,
    students: 0,
    status: 'coming-soon',
    featured: false,
    skills: ['SEO', 'Google Analytics', 'A/B Testing', 'Content Marketing', 'Copywriting']
  }
];

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to standard .env

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecretkey123';

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Create uploads directory if it does not exist (using /tmp on serverless environments like Vercel)
const UPLOADS_DIR = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve('server/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Extend Express Request type
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    sessionToken?: string;
  };
}

// Authentication Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({ error: 'Invalid or expired token.' });
      return;
    }
    const payload = decoded as { id: string; email: string; role: string; sessionToken?: string };
    if (!payload.sessionToken) {
      res.status(401).json({ error: 'Session token missing in credentials.' });
      return;
    }

    try {
      const session = await prisma.userSession.findUnique({
        where: { sessionToken: payload.sessionToken }
      });

      if (!session || session.userId !== payload.id || session.revokedAt || session.expiresAt <= new Date()) {
        res.status(401).json({ error: 'Session expired or invalid.' });
        return;
      }

      // Check inactivity
      const now = new Date();
      const inactivityTimeoutMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || '30');
      const inactivityTimeoutMs = inactivityTimeoutMinutes * 60 * 1000;
      const inactivityCutoff = new Date(now.getTime() - inactivityTimeoutMs);

      if (session.lastActivityAt <= inactivityCutoff) {
        // Revoke the session since it's inactive
        await prisma.userSession.update({
          where: { sessionToken: payload.sessionToken },
          data: { revokedAt: now }
        });
        res.status(401).json({ error: 'Session expired due to inactivity.' });
        return;
      }

      // Touch session
      await prisma.userSession.update({
        where: { sessionToken: payload.sessionToken },
        data: { lastActivityAt: now }
      });

      req.user = payload;
      next();
    } catch (dbErr) {
      res.status(500).json({ error: 'Session verification failed due to database error.' });
    }
  });
};

// Admin Authorization Middleware
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
};

// Mentor Authorization Middleware
const requireMentor = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'mentor') {
    res.status(403).json({ error: 'Access denied. Mentor privileges required.' });
    return;
  }
  next();
};

// Admin or Mentor Authorization Middleware
const requireAdminOrMentor = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'mentor')) {
    res.status(403).json({ error: 'Access denied. Unauthorized role.' });
    return;
  }
  next();
};

// Helper: Log Platform Activity
const logActivity = async (action: string, details: string) => {
  try {
    await prisma.activityLog.create({
      data: { action, details }
    });
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
};

// Helper: Format user response object
const formatUserResponse = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: true,
      progress: true
    }
  });

  if (!user) return null;

  // Transform enrolledCourses to array of courseIds
  const enrolledCourses = user.enrollments.map(e => e.courseId);

  // Transform progress to Record<courseId, lessonId[]>
  const progress: Record<string, string[]> = {};
  user.progress.forEach(p => {
    if (!progress[p.courseId]) {
      progress[p.courseId] = [];
    }
    progress[p.courseId].push(p.lessonId);
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || undefined,
    avatar: user.avatar || undefined,
    role: user.role,
    status: user.status,
    enrolledCourses,
    progress
  };
};

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Get homepage details (Hero config, Statistics, Testimonials, Categories)
app.get('/api/homepage', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await prisma.statItem.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    const testimonials = await prisma.testimonial.findMany();
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    const heroTitle = await prisma.homepageSetting.findUnique({ where: { key: 'heroTitle' } });
    const heroSubtitle = await prisma.homepageSetting.findUnique({ where: { key: 'heroSubtitle' } });
    const heroDescription = await prisma.homepageSetting.findUnique({ where: { key: 'heroDescription' } });
    
    res.json({
      hero: {
        title: heroTitle?.value || 'Learn the skills that make you useful.',
        subtitle: heroSubtitle?.value || 'Practical technology education',
        description: heroDescription?.value || 'Build confident, career-ready ability in cybersecurity and data science through focused lessons, hands-on labs, and projects worth showing.'
      },
      stats,
      testimonials,
      categories
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve homepage resources.' });
  }
});

// Register user
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email and password are required.' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'A user with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Make first registered user or admin@oxyfied.com an admin
    const count = await prisma.user.count();
    const role = (count === 0 || email.toLowerCase() === 'admin@oxyfied.com') ? 'admin' : 'student';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
      }
    });

    await logActivity('USER_REGISTER', `${user.name} (${user.email}) registered on the platform.`);

    // Create new active session for registered user
    const now = new Date();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt,
        userAgent: req.headers['user-agent'] || null,
        createdAt: now,
        lastActivityAt: now
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, sessionToken }, JWT_SECRET, { expiresIn: '7d' });
    const formatted = await formatUserResponse(user.id);

    res.status(201).json({
      success: true,
      token,
      user: formatted
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
});

// Login user
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid email address or password.' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(400).json({ error: 'Invalid email address or password.' });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    // Atomic session creation within a transaction with row lock
    let sessionToken: string;
    try {
      sessionToken = await prisma.$transaction(async (tx) => {
        // Lock the user row
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`;

        const now = new Date();
        const inactivityTimeoutMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || '30');
        // Previous active sessions will be automatically revoked below


        // Revoke any expired or stale sessions
        await tx.userSession.updateMany({
          where: {
            userId: user.id,
            revokedAt: null
          },
          data: {
            revokedAt: now
          }
        });

        // Create the new session
        const tokenStr = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await tx.userSession.create({
          data: {
            userId: user.id,
            sessionToken: tokenStr,
            expiresAt,
            userAgent: req.headers['user-agent'] || null,
            createdAt: now,
            lastActivityAt: now
          }
        });

        return tokenStr;
      });
    } catch (err: any) {
      if (err.message === 'ACCOUNT_ALREADY_LOGGED_IN') {
        res.status(409).json({
          error: 'This account is already logged in on another device. Please log out from that device before logging in here.',
          code: 'ACCOUNT_ALREADY_LOGGED_IN'
        });
        return;
      }
      throw err;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, sessionToken }, JWT_SECRET, { expiresIn: '7d' });
    const formatted = await formatUserResponse(user.id);

    res.json({
      success: true,
      token,
      user: formatted
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  res.json({
    success: true,
    message: 'Password reset link sent successfully.'
  });
});

// Logout user
app.post('/api/auth/logout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.sessionToken) {
      await prisma.userSession.update({
        where: { sessionToken: req.user.sessionToken },
        data: { revokedAt: new Date() }
      });
      await logActivity('USER_LOGOUT', `User ID ${req.user.id} logged out successfully.`);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed due to a server error.' });
  }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const formatted = await formatUserResponse(req.user!.id);
    if (!formatted) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// Update profile details
app.put('/api/users/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone } = req.body;

  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone }
    });

    const formatted = await formatUserResponse(req.user!.id);
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Get course listings
app.get('/api/courses', async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        mentor: { select: { name: true, profileImage: true } },
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });

    // Map response objects to match the client structures
    const formatted = courses.map(c => {
      // Calculate lesson count
      let lessonCount = 0;
      c.modules.forEach(m => {
        lessonCount += m.lessons.length;
      });

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        category: c.category.name,
        description: c.shortDescription,
        image: c.thumbnail,
        price: c.price,
        originalPrice: c.discountPrice || c.price, // map back
        duration: c.duration,
        lessons: lessonCount,
        level: c.level,
        rating: 4.8, // static rating fallback for SEO UI
        students: 1200, // static students fallback
        status: c.status as 'available' | 'coming-soon',
        featured: c.isFeatured,
        skills: c.skills,
        instructor: {
          name: c.mentor.name,
          profileImage: c.mentor.profileImage
        },
        modules: c.modules.map(mod => ({
          id: mod.id,
          title: mod.title,
          lessons: mod.lessons.map(l => ({
            id: l.id,
            title: l.title,
            duration: l.duration,
            isPreview: l.isPreview
          }))
        }))
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course listing.' });
  }
});

// Get course curriculum details by slug (Publicly visible lessons list, without private YouTube Video IDs)
app.get('/api/courses/:slug', async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as any;

  try {
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug }
        ]
      },
      include: {
        category: true,
        mentor: true,
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });

    if (!course) {
      res.status(404).json({ error: 'Course program not found.' });
      return;
    }

    // Calculate lesson count
    let lessonCount = 0;
    course.modules.forEach(m => {
      lessonCount += m.lessons.length;
    });

    // Strip private video ID fields for guest listing
    const modulesFormatted = course.modules.map(mod => ({
      id: mod.id,
      title: mod.title,
      description: mod.description || undefined,
      lessons: mod.lessons.map(l => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        isPreview: l.isPreview,
        content: l.description || undefined
      }))
    }));

    const responseCourse = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      category: course.category.name,
      description: course.description,
      image: course.thumbnail,
      price: course.price,
      originalPrice: course.discountPrice || course.price,
      duration: course.duration,
      lessons: lessonCount,
      level: course.level,
      rating: 4.8,
      students: 1250,
      status: course.status as 'available' | 'coming-soon',
      featured: course.isFeatured,
      skills: course.skills,
      requirements: course.requirements,
      whoIsItFor: course.whoIsItFor,
      modules: modulesFormatted,
      instructor: {
        id: course.mentor.id,
        name: course.mentor.name,
        role: course.mentor.designation,
        image: course.mentor.profileImage,
        bio: course.mentor.bio,
        linkedin: 'https://linkedin.com', // fallback
        expertise: course.mentor.expertise || []
      }
    };

    res.json(responseCourse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course details.' });
  }
});

// Get public instructors list
app.get('/api/instructors', async (req: Request, res: Response): Promise<void> => {
  try {
    const mentors = await prisma.mentor.findMany({
      where: { isActive: true }
    });
    const formatted = mentors.map(m => ({
      id: m.id,
      name: m.name,
      designation: m.designation,
      bio: m.bio,
      profileImage: m.profileImage,
      email: m.email,
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve instructors.' });
  }
});

// Helper: Resolve & Sign Bunny Stream Video URLs
const generateBunnyStreamAccess = (videoInput?: string | null, customLibraryId?: string | null) => {
  const envLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID || '';
  const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY || process.env.BUNNY_STREAM_API_KEY || '';
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || '';

  if (!videoInput) {
    return {
      videoId: '',
      libraryId: envLibraryId,
      hlsUrl: '',
      embedUrl: '',
      token: ''
    };
  }

  const raw = videoInput.trim();
  let libraryId = (customLibraryId && customLibraryId.trim()) || envLibraryId;
  let videoId = raw;

  // Pattern 1: iframe.mediadelivery.net/embed/{libraryId}/{videoId}
  const embedMatch = raw.match(/iframe\.mediadelivery\.net\/embed\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
  if (embedMatch) {
    libraryId = embedMatch[1];
    videoId = embedMatch[2];
  }

  // Pattern 2: iframe.mediadelivery.net/play/{libraryId}/{videoId}
  const playMatch = raw.match(/iframe\.mediadelivery\.net\/play\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
  if (playMatch) {
    libraryId = playMatch[1];
    videoId = playMatch[2];
  }

  // Pattern 3: vz-{libraryId}.b-cdn.net/{videoId}/playlist.m3u8 or {hostname}/{videoId}/playlist.m3u8
  const hlsMatch = raw.match(/(?:vz-([a-zA-Z0-9_-]+)\.b-cdn\.net|([a-zA-Z0-9_.-]+)\.b-cdn\.net)\/([a-zA-Z0-9_-]+)/i);
  if (hlsMatch) {
    if (hlsMatch[1]) libraryId = hlsMatch[1];
    videoId = hlsMatch[3];
  }

  const hostname = cdnHostname || (libraryId ? `vz-${libraryId}.b-cdn.net` : 'video.bunnycdn.com');
  const expires = Math.floor(Date.now() / 1000) + 3600 * 6; // 6 hours expiration

  let hlsUrl = `https://${hostname}/${videoId}/playlist.m3u8`;
  let embedUrl = libraryId 
    ? `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`
    : `https://iframe.mediadelivery.net/play/${videoId}`;

  let token = '';
  if (tokenKey) {
    // Bunny Stream Token Authentication SHA256 signature
    token = crypto.createHash('sha256').update(`${tokenKey}${videoId}${expires}`).digest('hex');
    hlsUrl = `${hlsUrl}?token=${token}&expires=${expires}`;
    embedUrl = `${embedUrl}&token=${token}&expires=${expires}`;
  }

  return {
    videoId,
    libraryId,
    hlsUrl,
    embedUrl,
    token
  };
};

// Helper: Format lesson video authorization payload
const formatVideoAuthorizationPayload = (lesson: any, streamToken: string) => {
  const isBunny = 
    lesson.videoType === 'bunny' || 
    (lesson.videoUrl && (lesson.videoUrl.includes('b-cdn.net') || lesson.videoUrl.includes('mediadelivery.net'))) ||
    (!lesson.youtubeVideoId && lesson.videoUrl && !lesson.videoUrl.includes('youtube.com') && !lesson.videoUrl.includes('youtu.be') && lesson.videoType !== 'custom' && lesson.videoType !== 'hls');

  if (isBunny) {
    const bunnyAccess = generateBunnyStreamAccess(lesson.videoUrl || lesson.youtubeVideoId);
    return {
      success: true,
      videoType: 'bunny',
      bunnyVideoId: bunnyAccess.videoId,
      bunnyLibraryId: bunnyAccess.libraryId,
      hlsUrl: bunnyAccess.hlsUrl,
      embedUrl: bunnyAccess.embedUrl,
      videoUrl: bunnyAccess.hlsUrl, // direct fallback to HLS playlist for player
      youtubeVideoId: undefined,
      token: streamToken
    };
  }

  return {
    success: true,
    videoType: lesson.videoType,
    videoUrl: lesson.videoUrl,
    youtubeVideoId: lesson.youtubeVideoId,
    token: streamToken
  };
};

// Secure video stream authorization check (returns video URL/youtube ID/Bunny stream only if enrolled or lesson is preview)
app.get('/api/videos/authorize', async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, lessonId } = req.query;

  if (!courseId || !lessonId) {
    res.status(400).json({ error: 'courseId and lessonId are required parameters.' });
    return;
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId as string }
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    // 1. If lesson is marked preview, anyone can watch it
    if (lesson.isPreview) {
      res.json(formatVideoAuthorizationPayload(lesson, 'PREVIEW_GRANTED'));
      return;
    }

    // 2. Otherwise, check if user is authenticated and enrolled in the course
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access denied. Enrollment required to watch this lesson.' });
      return;
    }

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        res.status(401).json({ error: 'Session expired. Please log in again.' });
        return;
      }

      const payload = decoded as { id: string; email: string; role: string; sessionToken?: string };

      if (!payload.sessionToken) {
        res.status(401).json({ error: 'Session token missing.' });
        return;
      }

      try {
        const session = await prisma.userSession.findUnique({
          where: { sessionToken: payload.sessionToken }
        });

        if (!session || session.userId !== payload.id || session.revokedAt || session.expiresAt <= new Date()) {
          res.status(401).json({ error: 'Session expired or invalid.' });
          return;
        }

        // Check inactivity
        const now = new Date();
        const inactivityTimeoutMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || '30');
        const inactivityTimeoutMs = inactivityTimeoutMinutes * 60 * 1000;
        const inactivityCutoff = new Date(now.getTime() - inactivityTimeoutMs);

        if (session.lastActivityAt <= inactivityCutoff) {
          // Revoke the session since it's inactive
          await prisma.userSession.update({
            where: { sessionToken: payload.sessionToken },
            data: { revokedAt: now }
          });
          res.status(401).json({ error: 'Session expired due to inactivity.' });
          return;
        }

        // Touch session
        await prisma.userSession.update({
          where: { sessionToken: payload.sessionToken },
          data: { lastActivityAt: now }
        });

        // Check enrollment
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: payload.id,
              courseId: courseId as string
            }
          }
        });

        // Admins bypass enrollment checks
        if (!enrollment && payload.role !== 'admin') {
          res.status(403).json({ error: 'You do not have access. Please purchase or enroll in this course first.' });
          return;
        }

        const streamToken = `stream_auth_${payload.id.substring(0, 5)}_${Math.random().toString(36).substring(2, 7)}`;
        res.json(formatVideoAuthorizationPayload(lesson, streamToken));
      } catch (dbErr) {
        res.status(500).json({ error: 'Database verification failed.' });
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to verify video access credentials.' });
  }
});

// Mark lesson progress
app.post('/api/progress/complete', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, lessonId } = req.body;

  if (!courseId || !lessonId) {
    res.status(400).json({ error: 'courseId and lessonId are required.' });
    return;
  }

  try {
    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId
        }
      }
    });

    if (!enrollment && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not enrolled in this course.' });
      return;
    }

    // Upsert lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: req.user!.id,
          lessonId
        }
      },
      create: {
        userId: req.user!.id,
        courseId,
        lessonId
      },
      update: {}
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record progress.' });
  }
});

// Payments Order creation (Mock simulation)
app.post('/api/payments/order', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, amount } = req.body;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    // Simple mock response mimicking Razorpay/Stripe payload
    res.json({
      success: true,
      orderId: `order_${Math.random().toString(36).substring(2, 10)}`,
      amount: (amount || course.price) * 100, // cents/paise
      currency: 'USD',
      keyId: 'rzp_live_Oxyfied_key_xyz123'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment order.' });
  }
});

// Payments Verification & Automatic Enrollment
app.post('/api/payments/verify', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { razorpay_payment_id, razorpay_order_id, courseId } = req.body;

  if (!courseId) {
    res.status(400).json({ error: 'courseId is required to enroll.' });
    return;
  }

  try {
    // Establish enrollment connection in DB
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId
        }
      },
      create: {
        userId: req.user!.id,
        courseId,
        status: 'active',
        progress: 0
      },
      update: {}
    });

    const usr = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const crs = await prisma.course.findUnique({ where: { id: courseId } });
    if (usr && crs) {
      await logActivity('COURSE_ENROLL', `${usr.name} enrolled in "${crs.title}".`);
    }

    res.json({
      success: true,
      enrolled: true,
      paymentId: razorpay_payment_id || `sim_${Math.random().toString(36).substring(2, 9)}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification & enrollment failed.' });
  }
});

// ==========================================
// SECURE ADMIN CRUD ENDPOINTS
// ==========================================

// Fetch Admin Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const totalCourses = await prisma.course.count();
    const activeCourses = await prisma.course.count({ where: { isActive: true } });
    const totalCategories = await prisma.category.count();
    const totalMentors = await prisma.mentor.count();
    const totalLessons = await prisma.lesson.count();
    const totalEnrollments = await prisma.enrollment.count();

    res.json({
      totalCourses,
      activeCourses,
      totalCategories,
      totalInstructors: totalMentors, // compat
      totalLessons,
      totalEnrollments
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve database counts.' });
  }
});

// --- Category CRUD ---
app.get('/api/admin/categories', authenticateToken, requireAdminOrMentor, async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json(categories);
});

app.post('/api/admin/categories', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { name, slug, description, image, icon, isActive, sortOrder } = req.body;
  if (!name || !slug) {
    res.status(400).json({ error: 'Name and slug are required.' });
    return;
  }
  try {
    const category = await prisma.category.create({
      data: { name, slug, description, image, icon, isActive: isActive ?? true, sortOrder: sortOrder ? parseInt(sortOrder) : 0 }
    });
    await logActivity('CATEGORY_CREATE', `Category "${category.name}" created.`);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Duplicate slug or invalid payload.' });
  }
});

app.put('/api/admin/categories/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { name, slug, description, image, icon, isActive, sortOrder } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description, image, icon, isActive, sortOrder: sortOrder ? parseInt(sortOrder) : undefined }
    });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update category.' });
  }
});

app.delete('/api/admin/categories/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const courses = await prisma.course.count({ where: { categoryId: id } });
    if (courses > 0) {
      res.status(400).json({ error: 'Cannot delete category containing active courses. Re-assign courses first.' });
      return;
    }
    const category = await prisma.category.delete({ where: { id } });
    await logActivity('CATEGORY_DELETE', `Category "${category.name}" deleted.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed.' });
  }
});

// --- User Management CRUD (NEW) ---
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { search, role, status, sortBy = 'createdAt', sortOrder = 'desc', page = '1', limit = '10' } = req.query as any;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (role && role !== 'all') {
    where.role = role;
  }
  if (status && status !== 'all') {
    where.status = status;
  }

  try {
    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum,
      include: {
        enrollments: {
          include: {
            course: { select: { title: true } }
          }
        },
        progress: true
      }
    });

    const userIds = users.map(u => u.id);
    const inactivityTimeoutMinutes = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || '30');
    const inactivityTimeoutMs = inactivityTimeoutMinutes * 60 * 1000;
    const inactivityCutoff = new Date(Date.now() - inactivityTimeoutMs);

    const activeSessions = await prisma.userSession.findMany({
      where: {
        userId: { in: userIds },
        revokedAt: null,
        expiresAt: { gt: new Date() },
        lastActivityAt: { gt: inactivityCutoff }
      }
    });

    const activeSessionMap = new Map(activeSessions.map(s => [s.userId, s]));

    const formatted = users.map(u => {
      const progress: Record<string, string[]> = {};
      u.progress.forEach(p => {
        if (!progress[p.courseId]) progress[p.courseId] = [];
        progress[p.courseId].push(p.lessonId);
      });

      const activeSession = activeSessionMap.get(u.id);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        enrollmentsCount: u.enrollments.length,
        progress,
        enrollments: u.enrollments.map(e => ({
          id: e.id,
          courseId: e.courseId,
          courseTitle: e.course.title,
          status: e.status,
          progress: e.progress,
          createdAt: e.createdAt
        })),
        activeSession: activeSession ? {
          id: activeSession.id,
          createdAt: activeSession.createdAt,
          lastActivityAt: activeSession.lastActivityAt,
          userAgent: activeSession.userAgent
        } : null
      };
    });

    res.json({
      total,
      page: pageNum,
      limit: limitNum,
      users: formatted
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to query users.' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { name, email, phone, role, status } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, phone, role, status }
    });
    // If updating a mentor user's name/email, sync with Mentor model
    if (role === 'mentor') {
      await prisma.mentor.updateMany({
        where: { userId: id },
        data: { name, email, status }
      });
    }
    await logActivity('USER_UPDATE', `User "${user.email}" role set to ${role}, status set to ${status}.`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Revoke user active sessions (Admin capability)
app.post('/api/admin/users/:id/revoke-session', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    await prisma.userSession.updateMany({
      where: {
        userId: id,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
    await logActivity('SESSION_REVOKE', `Active sessions for user ID ${id} revoked by admin.`);
    res.json({ success: true, message: 'Sessions revoked successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke session.' });
  }
});

// --- Mentors CRUD (Updated & Extended) ---
app.get('/api/admin/mentors', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const mentors = await prisma.mentor.findMany({
    include: {
      courses: { select: { id: true, title: true } }
    }
  });
  res.json(mentors);
});

// Backward compatibility endpoint
app.get('/api/admin/instructors', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const mentors = await prisma.mentor.findMany();
  res.json(mentors.map(m => ({ ...m, designation: m.designation, profileImage: m.profileImage })));
});

app.post('/api/admin/mentors', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, bio, expertise, profileImage, designation, password } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required.' });
    return;
  }
  const mentorEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@oxyfied.com`;
  const mentorPassword = password || 'mentorpassword123';

  try {
    const existing = await prisma.user.findUnique({ where: { email: mentorEmail } });
    if (existing) {
      res.status(400).json({ error: 'A user with this email address already exists.' });
      return;
    }
    const passwordHash = await bcrypt.hash(mentorPassword, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: mentorEmail,
        phone,
        passwordHash,
        role: 'mentor',
        avatar: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
      }
    });

    const mentor = await prisma.mentor.create({
      data: {
        userId: user.id,
        name,
        email: mentorEmail,
        bio: bio || '',
        expertise: expertise || [],
        profileImage: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
        designation: designation || 'Mentor'
      }
    });

    await logActivity('MENTOR_CREATED', `Mentor "${mentor.name}" was added.`);
    res.status(201).json(mentor);
  } catch (err) {
    console.error('Mentor creation error:', err);
    res.status(500).json({ error: 'Failed to create mentor.' });
  }
});

// Backward compatibility endpoints for courseService calls
app.post('/api/admin/instructors', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { name, designation, bio, profileImage, email } = req.body;
  try {
    const passwordHash = await bcrypt.hash('mentorpassword123', 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@oxyfied.com`,
        passwordHash,
        role: 'mentor',
        avatar: profileImage
      }
    });
    const mentor = await prisma.mentor.create({
      data: {
        userId: user.id,
        name,
        email: email || user.email,
        bio,
        profileImage,
        designation
      }
    });
    res.json(mentor);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create instructor.' });
  }
});

app.put('/api/admin/mentors/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { name, email, bio, expertise, profileImage, designation, status } = req.body;
  try {
    const mentor = await prisma.mentor.update({
      where: { id },
      data: {
        name,
        email,
        bio,
        expertise,
        profileImage,
        designation,
        status,
        isActive: status === 'active'
      }
    });
    // Sync to User table
    await prisma.user.update({
      where: { id: mentor.userId },
      data: { name, email, avatar: profileImage, status }
    });
    await logActivity('MENTOR_UPDATE', `Mentor profile for "${mentor.name}" was updated.`);
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update mentor.' });
  }
});

app.put('/api/admin/instructors/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { name, designation, bio, profileImage, email, isActive } = req.body;
  try {
    const mentor = await prisma.mentor.update({
      where: { id },
      data: {
        name,
        email,
        bio,
        profileImage,
        designation,
        isActive,
        status: isActive ? 'active' : 'inactive'
      }
    });
    await prisma.user.update({
      where: { id: mentor.userId },
      data: { name, email, avatar: profileImage, status: isActive ? 'active' : 'inactive' }
    });
    res.json(mentor);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update instructor.' });
  }
});

app.delete('/api/admin/mentors/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const courses = await prisma.course.count({ where: { mentorId: id } });
    if (courses > 0) {
      res.status(400).json({ error: 'Mentor is assigned to active courses. Re-assign courses first.' });
      return;
    }
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (mentor) {
      await prisma.user.delete({ where: { id: mentor.userId } }); // also cascades mentor record due to DB referential integrity
      await logActivity('MENTOR_DELETE', `Mentor "${mentor.name}" was removed.`);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed.' });
  }
});

app.delete('/api/admin/instructors/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const courses = await prisma.course.count({ where: { mentorId: id } });
    if (courses > 0) {
      res.status(400).json({ error: 'Instructor is assigned to active courses. Re-assign courses first.' });
      return;
    }
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (mentor) {
      await prisma.user.delete({ where: { id: mentor.userId } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed.' });
  }
});

// --- Course CRUD ---
app.get('/api/admin/courses', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    include: {
      category: { select: { name: true } },
      mentor: { select: { name: true } }
    }
  });
  // Map back to Instructor model for old UI
  res.json(courses.map(c => ({
    ...c,
    instructor: c.mentor,
    instructorId: c.mentorId
  })));
});

app.post('/api/admin/courses', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const {
    title, slug, shortDescription, description, thumbnail,
    categoryId, instructorId, mentorId: inputMentorId, price, discountPrice, duration,
    level, status, isFeatured, isActive, skills, requirements, whoIsItFor
  } = req.body;

  // Adapt instructorId or mentorId
  const mentorId = instructorId || inputMentorId;

  if (!title || !slug || !categoryId || !mentorId || price === undefined) {
    res.status(400).json({ error: 'Title, slug, category, mentor, and price are required.' });
    return;
  }

  try {
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        shortDescription,
        description,
        thumbnail,
        categoryId,
        mentorId,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        duration,
        level,
        status: status || 'draft',
        isFeatured: isFeatured ?? false,
        isActive: isActive !== undefined ? isActive : (status ? status === 'available' : true),
        skills: skills || [],
        requirements: requirements || [],
        whoIsItFor: whoIsItFor || []
      }
    });
    await logActivity('COURSE_CREATE', `Course "${course.title}" was created.`);
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: 'Duplicate slug or database save error.' });
  }
});

app.put('/api/admin/courses/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const {
    title, slug, shortDescription, description, thumbnail,
    categoryId, instructorId, mentorId: inputMentorId, price, discountPrice, duration,
    level, status, isFeatured, isActive, skills, requirements, whoIsItFor
  } = req.body;

  const mentorId = instructorId || inputMentorId;

  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        slug,
        shortDescription,
        description,
        thumbnail,
        categoryId,
        mentorId: mentorId || undefined,
        price: price !== undefined && price !== '' ? parseFloat(price) : undefined,
        discountPrice: discountPrice !== undefined ? (discountPrice ? parseFloat(discountPrice) : null) : undefined,
        duration,
        level,
        status,
        isFeatured,
        isActive: isActive !== undefined ? isActive : (status ? status === 'available' : undefined),
        skills,
        requirements,
        whoIsItFor
      }
    });
    await logActivity('COURSE_UPDATE', `Course "${course.title}" was updated.`);
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update course.' });
  }
});

app.delete('/api/admin/courses/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    const course = await prisma.course.delete({ where: { id } });
    await logActivity('COURSE_DELETE', `Course "${course.title}" was deleted.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

// --- Curriculum / Module & Lessons CRUD ---
app.get('/api/admin/courses/:courseId/lessons', authenticateToken, requireAdminOrMentor, async (req: Request, res: Response) => {
  const { courseId } = req.params as any;
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { sortOrder: 'asc' },
    include: {
      lessons: { orderBy: { sortOrder: 'asc' } }
    }
  });
  res.json(modules);
});

// Add module to course
app.post('/api/admin/courses/:courseId/modules', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params as any;
  const { title, description, sortOrder } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Module title is required.' });
    return;
  }
  try {
    const mod = await prisma.module.create({
      data: { courseId, title, description, sortOrder: sortOrder ? parseInt(sortOrder) : 0 }
    });
    res.json(mod);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create curriculum module.' });
  }
});

app.post('/api/admin/modules', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId, title, description, sortOrder } = req.body;
  try {
    const mod = await prisma.module.create({
      data: { courseId, title, description, sortOrder: sortOrder ? parseInt(sortOrder) : 0 }
    });
    res.json(mod);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create module.' });
  }
});

app.put('/api/admin/modules/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { title, description, sortOrder } = req.body;
  try {
    const mod = await prisma.module.update({
      where: { id },
      data: { title, description, sortOrder: sortOrder ? parseInt(sortOrder) : undefined }
    });
    res.json(mod);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update module.' });
  }
});

// Add lesson to module
app.post('/api/admin/courses/:courseId/modules/:moduleId/lessons', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId, moduleId } = req.params as any;
  const { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview, isActive } = req.body;
  if (!title || !duration) {
    res.status(400).json({ error: 'Lesson title and duration are required.' });
    return;
  }
  try {
    const lesson = await prisma.lesson.create({
      data: {
        courseId, moduleId, title, description,
        videoType: videoType || 'youtube', videoUrl, youtubeVideoId,
        duration, sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isPreview: isPreview ?? false, isActive: isActive ?? true
      }
    });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create lesson.' });
  }
});

app.post('/api/admin/lessons', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId, moduleId, title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview, isActive } = req.body;
  try {
    const lesson = await prisma.lesson.create({
      data: {
        courseId, moduleId, title, description,
        videoType: videoType || 'youtube', videoUrl, youtubeVideoId,
        duration, sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isPreview: isPreview ?? false, isActive: isActive ?? true
      }
    });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create lesson.' });
  }
});

// Edit lesson
app.put('/api/admin/lessons/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview, isActive } = req.body;
  try {
    const lesson = await prisma.lesson.update({
      where: { id },
      data: { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder: sortOrder ? parseInt(sortOrder) : undefined, isPreview, isActive }
    });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update lesson.' });
  }
});

// Delete lesson
app.delete('/api/admin/lessons/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    await prisma.lesson.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lesson.' });
  }
});

// Delete module (cascades lessons)
app.delete('/api/admin/modules/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    await prisma.module.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete module.' });
  }
});

// Fetch detailed lesson info (private YouTube IDs)
app.get('/api/admin/lessons/:id', authenticateToken, requireAdminOrMentor, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load lesson details.' });
  }
});

// --- Admin Enrollments endpoints ---
app.get('/api/admin/enrollments', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve enrollments.' });
  }
});

app.post('/api/admin/enrollments', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { email, courseId } = req.body;
  if (!email || !courseId) {
    res.status(400).json({ error: 'Email and course ID are required.' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'No user registered with this email address.' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: user.id, courseId }
      },
      create: {
        userId: user.id,
        courseId,
        status: 'active',
        progress: 0
      },
      update: {
        status: 'active'
      }
    });

    await logActivity('COURSE_ENROLL', `Admin manually enrolled ${user.name} in "${course.title}".`);
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to enroll student.' });
  }
});

app.put('/api/admin/enrollments/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  const { status, progress } = req.body;
  try {
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (progress !== undefined) data.progress = parseInt(progress);
    if (status === 'completed') data.completionDate = new Date();

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      }
    });

    await logActivity('ENROLLMENT_UPDATE', `Enrollment for ${enrollment.user.name} in "${enrollment.course.title}" status set to ${status}.`);
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update enrollment.' });
  }
});

app.delete('/api/admin/enrollments/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params as any;
  try {
    const enrollment = await prisma.enrollment.delete({
      where: { id },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      }
    });
    await logActivity('ENROLLMENT_DELETE', `Manually deleted enrollment for ${enrollment.user.name} from "${enrollment.course.title}".`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove enrollment.' });
  }
});

// --- Admin Platform Analytics API ---
app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { range = '30days' } = req.query as any;

  try {
    // 1. KPI Calculations
    const totalUsers = await prisma.user.count();
    const totalMentors = await prisma.mentor.count();
    const totalCourses = await prisma.course.count();
    const activeCourses = await prisma.course.count({ where: { isActive: true } });
    const totalEnrollments = await prisma.enrollment.count();

    // New Users (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });

    // Enrollments This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const enrollmentsThisMonth = await prisma.enrollment.count({
      where: { createdAt: { gte: startOfMonth } }
    });

    // Most Popular Course
    const enrollmentCountsByCourse = await prisma.enrollment.groupBy({
      by: ['courseId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1
    });

    let mostPopularCourse = 'N/A';
    if (enrollmentCountsByCourse.length > 0) {
      const topCourse = await prisma.course.findUnique({
        where: { id: enrollmentCountsByCourse[0].courseId }
      });
      mostPopularCourse = topCourse ? topCourse.title : 'N/A';
    }

    // 2. User Registration Timeline
    let dateFilter = new Date();
    if (range === 'today') dateFilter.setHours(0, 0, 0, 0);
    else if (range === '7days') dateFilter.setDate(dateFilter.getDate() - 7);
    else if (range === '30days') dateFilter.setDate(dateFilter.getDate() - 30);
    else if (range === '3months') dateFilter.setMonth(dateFilter.getMonth() - 3);
    else if (range === 'thisyear') {
      dateFilter.setMonth(0);
      dateFilter.setDate(1);
    } else dateFilter.setDate(dateFilter.getDate() - 30); // fallback

    const registrationData = await prisma.user.findMany({
      where: { createdAt: { gte: dateFilter } },
      select: { createdAt: true }
    });

    // Group registrations by day/month depending on range
    const timelineMap: Record<string, number> = {};
    registrationData.forEach(u => {
      const dateStr = u.createdAt.toISOString().split('T')[0];
      timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
    });

    const userRegistrationTimeline = Object.entries(timelineMap).map(([date, count]) => ({
      date,
      registrations: count
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 3. Course Enrollments Stats & Course Performance Table
    const courses = await prisma.course.findMany({
      include: {
        mentor: { select: { name: true } },
        enrollments: { select: { id: true, status: true, progress: true } }
      }
    });

    const courseEnrollmentStats = courses.map(c => ({
      name: c.title,
      students: c.enrollments.length
    }));

    const coursePerformance = courses.map(c => {
      const activeEnrollments = c.enrollments.filter(e => e.status === 'active').length;
      const completedEnrollments = c.enrollments.filter(e => e.status === 'completed').length;
      const avgProgress = c.enrollments.length > 0 
        ? Math.round(c.enrollments.reduce((acc, curr) => acc + curr.progress, 0) / c.enrollments.length)
        : 0;

      return {
        id: c.id,
        name: c.title,
        mentor: c.mentor.name,
        totalEnrolled: c.enrollments.length,
        activeStudents: activeEnrollments,
        completionRate: c.enrollments.length > 0 ? Math.round((completedEnrollments / c.enrollments.length) * 100) : 0,
        avgProgress,
        status: c.status
      };
    });

    // 4. Mentor Performance Table
    const mentors = await prisma.mentor.findMany({
      include: {
        courses: {
          include: {
            enrollments: true
          }
        }
      }
    });

    const mentorPerformance = mentors.map(m => {
      const totalEnrollments = m.courses.reduce((acc, curr) => acc + curr.enrollments.length, 0);
      
      // Find mentor's most popular course
      let popularCourseTitle = 'N/A';
      if (m.courses.length > 0) {
        const sorted = [...m.courses].sort((a, b) => b.enrollments.length - a.enrollments.length);
        popularCourseTitle = sorted[0].title;
      }

      return {
        id: m.id,
        name: m.name,
        coursesCount: m.courses.length,
        totalEnrollments,
        mostPopularCourse: popularCourseTitle
      };
    });

    // 5. Recent Platform Activity Log
    const recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12
    });

    res.json({
      kpis: {
        totalUsers,
        newUsers,
        totalMentors,
        totalCourses,
        activeCourses,
        totalEnrollments,
        enrollmentsThisMonth,
        mostPopularCourse
      },
      userRegistrationTimeline,
      courseEnrollmentStats,
      coursePerformance,
      mentorPerformance,
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to query platform metrics.' });
  }
});

// ==========================================
// SECURE MENTOR DASHBOARD ENDPOINTS (NEW)
// ==========================================

// Middleware helper: fetch mentor tied to request user
const getAuthenticatedMentor = async (userId: string) => {
  return await prisma.mentor.findUnique({
    where: { userId }
  });
};

// Fetch courses assigned to current mentor
app.get('/api/mentor/courses', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const courses = await prisma.course.findMany({
      where: { mentorId: mentor.id },
      include: {
        category: { select: { name: true } },
        enrollments: { select: { id: true } }
      }
    });

    res.json(courses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.shortDescription,
      image: c.thumbnail,
      price: c.price,
      duration: c.duration,
      status: c.status,
      category: c.category.name,
      studentsCount: c.enrollments.length,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentor courses.' });
  }
});

// Add course owned by mentor
app.post('/api/mentor/courses', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, slug, shortDescription, description, thumbnail, categoryId, price, duration, level, skills, requirements, whoIsItFor } = req.body;
  if (!title || !slug || !categoryId || price === undefined) {
    res.status(400).json({ error: 'Title, slug, category, and price are required.' });
    return;
  }

  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        shortDescription,
        description,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop',
        categoryId,
        mentorId: mentor.id,
        price: parseFloat(price),
        duration: duration || '8 Weeks',
        level: level || 'Beginner',
        status: 'draft',
        skills: skills || [],
        requirements: requirements || [],
        whoIsItFor: whoIsItFor || []
      }
    });

    await logActivity('COURSE_CREATE', `Mentor "${mentor.name}" created course "${course.title}".`);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: 'Duplicate course slug or invalid details.' });
  }
});

// Update course detail (Ownership checked)
app.put('/api/mentor/courses/:id', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { title, slug, shortDescription, description, thumbnail, categoryId, price, duration, level, status, skills, requirements, whoIsItFor } = req.body;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    if (course.mentorId !== mentor.id) {
      res.status(403).json({ error: 'Unauthorized. You can only manage your own courses.' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title, slug, shortDescription, description, thumbnail, categoryId,
        price: price ? parseFloat(price) : undefined, duration, level, status,
        skills, requirements, whoIsItFor
      }
    });

    await logActivity('COURSE_UPDATE', `Mentor "${mentor.name}" updated course "${course.title}".`);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update course.' });
  }
});

// Delete course (Ownership checked)
app.delete('/api/mentor/courses/:id', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    if (course.mentorId !== mentor.id) {
      res.status(403).json({ error: 'Unauthorized. You can only delete your own courses.' });
      return;
    }

    await prisma.course.delete({ where: { id } });
    await logActivity('COURSE_DELETE', `Mentor "${mentor.name}" deleted course "${course.title}".`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

// Fetch syllabus for Mentor's course
app.get('/api/mentor/courses/:courseId/lessons', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params as any;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.mentorId !== mentor.id) {
      res.status(403).json({ error: 'Unauthorized access to course curriculum.' });
      return;
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        lessons: { orderBy: { sortOrder: 'asc' } }
      }
    });

    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lessons.' });
  }
});

// Manage curriculum modules (Ownership checked)
app.post('/api/mentor/courses/:courseId/modules', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params as any;
  const { title, description, sortOrder } = req.body;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.mentorId !== mentor?.id) {
      res.status(403).json({ error: 'Unauthorized course access.' });
      return;
    }

    const mod = await prisma.module.create({
      data: { courseId, title, description, sortOrder: sortOrder ? parseInt(sortOrder) : 0 }
    });
    res.json(mod);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create module.' });
  }
});

app.put('/api/mentor/modules/:id', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { title, description, sortOrder } = req.body;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    const mod = await prisma.module.findUnique({ where: { id }, include: { course: true } });
    if (!mod || mod.course.mentorId !== mentor?.id) {
      res.status(403).json({ error: 'Unauthorized module access.' });
      return;
    }

    const updated = await prisma.module.update({
      where: { id },
      data: { title, description, sortOrder: sortOrder ? parseInt(sortOrder) : undefined }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit module.' });
  }
});

app.delete('/api/mentor/modules/:id', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    const mod = await prisma.module.findUnique({ where: { id }, include: { course: true } });
    if (!mod || mod.course.mentorId !== mentor?.id) {
      res.status(403).json({ error: 'Unauthorized module access.' });
      return;
    }

    await prisma.module.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete module.' });
  }
});

// Manage curriculum lessons (Ownership checked)
app.post('/api/mentor/courses/:courseId/modules/:moduleId/lessons', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, moduleId } = req.params as any;
  const { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview } = req.body;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.mentorId !== mentor?.id) {
      res.status(403).json({ error: 'Unauthorized course access.' });
      return;
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId, moduleId, title, description,
        videoType: videoType || 'youtube', videoUrl, youtubeVideoId,
        duration, sortOrder: sortOrder ? parseInt(sortOrder) : 0, isPreview
      }
    });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add lesson.' });
  }
});

app.put('/api/mentor/lessons/:id', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  const { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder, isPreview } = req.body;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: { course: true } });
    if (!lesson || lesson.course.mentorId !== mentor?.id) {
      res.status(403).json({ error: 'Unauthorized lesson access.' });
      return;
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: { title, description, videoType, videoUrl, youtubeVideoId, duration, sortOrder: sortOrder ? parseInt(sortOrder) : undefined, isPreview }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit lesson.' });
  }
});

app.delete('/api/mentor/lessons/:id', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as any;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: { course: true } });
    if (!lesson || lesson.course.mentorId !== mentor?.id) {
      res.status(403).json({ error: 'Unauthorized lesson access.' });
      return;
    }

    await prisma.lesson.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lesson.' });
  }
});

// Fetch students enrolled in Mentor's courses
app.get('/api/mentor/courses/:courseId/students', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params as any;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.mentorId !== mentor?.id) {
      res.status(403).json({ error: 'Unauthorized course access.' });
      return;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(enrollments.map(e => ({
      id: e.id,
      studentName: e.user.name,
      studentEmail: e.user.email,
      enrollmentDate: e.createdAt,
      status: e.status,
      progress: e.progress
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load students list.' });
  }
});

// Fetch stats/analytics for Mentor's dashboard
app.get('/api/mentor/analytics', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const courses = await prisma.course.findMany({
      where: { mentorId: mentor.id },
      include: {
        enrollments: true
      }
    });

    const totalCourses = courses.length;
    const totalEnrollments = courses.reduce((acc, curr) => acc + curr.enrollments.length, 0);
    const activeStudents = courses.reduce((acc, curr) => acc + curr.enrollments.filter(e => e.status === 'active').length, 0);
    const avgProgress = totalEnrollments > 0
      ? Math.round(courses.reduce((acc, curr) => acc + curr.enrollments.reduce((sum, e) => sum + e.progress, 0), 0) / totalEnrollments)
      : 0;

    // Enrollment metrics by course for SVG chart
    const courseEnrollmentStats = courses.map(c => ({
      name: c.title,
      students: c.enrollments.length
    }));

    // Detailed Course Performance
    const coursesPerformance = courses.map(c => {
      const active = c.enrollments.filter(e => e.status === 'active').length;
      const completed = c.enrollments.filter(e => e.status === 'completed').length;
      const prog = c.enrollments.length > 0
        ? Math.round(c.enrollments.reduce((acc, curr) => acc + curr.progress, 0) / c.enrollments.length)
        : 0;

      return {
        id: c.id,
        name: c.title,
        totalEnrolled: c.enrollments.length,
        activeStudents: active,
        completionRate: c.enrollments.length > 0 ? Math.round((completed / c.enrollments.length) * 100) : 0,
        avgProgress: prog,
        status: c.status
      };
    });

    res.json({
      kpis: {
        totalCourses,
        totalEnrollments,
        activeStudents,
        avgProgress
      },
      courseEnrollmentStats,
      coursesPerformance
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve analytics.' });
  }
});

// Fetch Mentor Profile details
app.get('/api/mentor/profile', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(404).json({ error: 'Mentor profile not found.' });
      return;
    }
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// Update Mentor Profile bio & expertise
app.put('/api/mentor/profile', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, bio, expertise, profileImage, designation } = req.body;
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(404).json({ error: 'Mentor profile not found.' });
      return;
    }

    const updated = await prisma.mentor.update({
      where: { id: mentor.id },
      data: { name, bio, expertise, profileImage, designation }
    });

    // Also update associated User properties (name & avatar)
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, avatar: profileImage }
    });

    await logActivity('MENTOR_UPDATE', `Mentor "${updated.name}" updated their profile details.`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Fetch all project submissions for courses taught by the authenticated mentor
app.get('/api/mentor/submissions', authenticateToken, requireMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mentor = await getAuthenticatedMentor(req.user!.id);
    if (!mentor) {
      res.status(403).json({ error: 'Mentor profile not found.' });
      return;
    }

    const submissions = await prisma.projectSubmission.findMany({
      where: {
        course: {
          mentorId: mentor.id
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
        lesson: { select: { title: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(submissions.map(s => ({
      id: s.id,
      studentName: s.user.name,
      studentEmail: s.user.email,
      courseTitle: s.course.title,
      lessonTitle: s.lesson.title,
      fileName: s.fileName,
      filePath: s.filePath,
      fileSize: s.fileSize,
      createdAt: s.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve mentor submissions.' });
  }
});

// Multer configuration for raw video file uploads to Bunny Stream
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const tempDir = path.resolve(UPLOADS_DIR, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `bunny-upload-${uniqueSuffix}-${safeName}`);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 1024 * 1024 * 1024 * 2 }, // 2 GB max video upload limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.flv', '.m4v', '.ts', '.wmv'];
    if (allowed.includes(ext) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Supported formats: MP4, MOV, MKV, WebM, AVI.'));
    }
  }
});

// Direct Bunny Stream Video Upload Route
app.post(
  '/api/videos/upload-bunny',
  authenticateToken,
  requireAdminOrMentor,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    videoUpload.single('videoFile')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response): Promise<void> => {
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!req.file) {
      res.status(400).json({ error: 'Please choose a video file to upload.' });
      return;
    }

    const tempFilePath = req.file.path;

    if (!libraryId || !apiKey) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      res.status(400).json({
        error:
          'Bunny Stream is not configured on the server. Please set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY in your .env file.'
      });
      return;
    }

    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');

    try {
      // 1. Create Video Object in Bunny Stream
      const createRes = await axios.post(
        `https://video.bunnycdn.com/library/${libraryId}/videos`,
        { title },
        {
          headers: {
            AccessKey: apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      );

      const videoId = createRes.data?.guid;

      if (!videoId) {
        throw new Error('Failed to obtain video GUID from Bunny Stream API response.');
      }

      // 2. Stream the binary file to Bunny Stream
      const fileStream = fs.createReadStream(tempFilePath);
      const fileStats = fs.statSync(tempFilePath);

      await axios.put(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
        fileStream,
        {
          headers: {
            AccessKey: apiKey,
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileStats.size
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 0 // Unlimited timeout for large video uploads
        }
      );

      // Clean up temporary local file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      const bunnyAccess = generateBunnyStreamAccess(videoId, libraryId);
      const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || `vz-${libraryId}.b-cdn.net`;

      await logActivity(
        'BUNNY_VIDEO_UPLOAD',
        `User "${req.user?.email}" uploaded video "${title}" to Bunny Stream (ID: ${videoId}).`
      );

      res.status(201).json({
        success: true,
        videoId,
        libraryId,
        title,
        hlsUrl: bunnyAccess.hlsUrl,
        embedUrl: bunnyAccess.embedUrl,
        directUrl: `https://${cdnHostname}/${videoId}/playlist.m3u8`
      });
    } catch (err: any) {
      console.error('Bunny Stream upload error:', err.response?.data || err.message);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      res.status(500).json({
        error:
          err.response?.data?.message ||
          err.message ||
          'Failed to upload video to Bunny Stream. Please verify your Library ID and API Key.'
      });
    }
  }
);

// Multer configuration for student project submissions
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const submissionUpload = multer({
  storage: submissionStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB file size limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.zip' || ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP and PDF files are allowed.'));
    }
  }
});

// Student Project Upload Route
app.post('/api/submissions/upload', authenticateToken, (req: AuthRequest, res: Response, next: NextFunction) => {
  submissionUpload.single('projectFile')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId } = req.body;
    if (!req.file) {
      res.status(400).json({ error: 'Please choose a file to upload.' });
      return;
    }
    if (!courseId || !lessonId) {
      // Remove uploaded file if body checks fail
      const filePathOnDisk = path.resolve(UPLOADS_DIR, req.file.filename);
      if (fs.existsSync(filePathOnDisk)) fs.unlinkSync(filePathOnDisk);
      res.status(400).json({ error: 'courseId and lessonId are required.' });
      return;
    }

    // Format file size
    const bytes = req.file.size;
    let sizeStr = '0 B';
    if (bytes < 1024) sizeStr = `${bytes} B`;
    else if (bytes < 1024 * 1024) sizeStr = `${(bytes / 1024).toFixed(1)} KB`;
    else sizeStr = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    // Save to database
    const filePath = `/uploads/${req.file.filename}`;
    const submission = await prisma.projectSubmission.create({
      data: {
        userId: req.user!.id,
        courseId,
        lessonId,
        fileName: req.file.originalname,
        filePath,
        fileSize: sizeStr
      }
    });

    await logActivity('PROJECT_SUBMIT', `User "${req.user!.email}" submitted project file "${req.file.originalname}" for lesson "${lessonId}".`);
    res.status(201).json(submission);
  } catch (err) {
    console.error('Upload handler error:', err);
    if (req.file) {
      const filePathOnDisk = path.resolve(UPLOADS_DIR, req.file.filename);
      if (fs.existsSync(filePathOnDisk)) fs.unlinkSync(filePathOnDisk);
    }
    res.status(500).json({ error: 'Failed to record project submission.' });
  }
});

// Fetch Student Submissions Route
app.get('/api/submissions/:courseId/:lessonId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId } = req.params as { courseId: string; lessonId: string };
    const submissions = await prisma.projectSubmission.findMany({
      where: {
        userId: req.user!.id,
        courseId,
        lessonId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve project submissions.' });
  }
});

// Delete Submission Route
app.delete('/api/submissions/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const submission = await prisma.projectSubmission.findUnique({
      where: { id }
    });

    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    // Authorize deletion: creator, admin, or mentor
    if (submission.userId !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'mentor') {
      res.status(403).json({ error: 'Unauthorized to delete this submission.' });
      return;
    }

    // Remove file from disk
    const fileName = path.basename(submission.filePath);
    const filePathOnDisk = path.resolve(UPLOADS_DIR, fileName);
    if (fs.existsSync(filePathOnDisk)) {
      fs.unlinkSync(filePathOnDisk);
    }

    // Remove from database
    await prisma.projectSubmission.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Submission deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project submission.' });
  }
});

// Mentor Lesson Resource Upload Route
app.post('/api/mentor/lessons/:lessonId/resources', authenticateToken, requireAdminOrMentor, (req: AuthRequest, res: Response, next: NextFunction) => {
  submissionUpload.single('resourceFile')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    if (!req.file) {
      res.status(400).json({ error: 'Please choose a file to upload.' });
      return;
    }

    // Format file size
    const bytes = req.file.size;
    let sizeStr = '0 B';
    if (bytes < 1024) sizeStr = `${bytes} B`;
    else if (bytes < 1024 * 1024) sizeStr = `${(bytes / 1024).toFixed(1)} KB`;
    else sizeStr = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    const filePath = `/uploads/${req.file.filename}`;
    const resource = await prisma.lessonResource.create({
      data: {
        lessonId,
        fileName: req.file.originalname,
        filePath,
        fileSize: sizeStr
      }
    });

    await logActivity('RESOURCE_UPLOAD', `Mentor/Admin "${req.user!.email}" uploaded resource "${req.file.originalname}" to lesson "${lessonId}".`);
    res.status(201).json(resource);
  } catch (err) {
    console.error('Resource upload error:', err);
    if (req.file) {
      const filePathOnDisk = path.resolve(UPLOADS_DIR, req.file.filename);
      if (fs.existsSync(filePathOnDisk)) fs.unlinkSync(filePathOnDisk);
    }
    res.status(500).json({ error: 'Failed to record lesson resource.' });
  }
});

// Fetch Lesson Resources Route
app.get('/api/lessons/:lessonId/resources', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    const resources = await prisma.lessonResource.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve lesson resources.' });
  }
});

// Delete Lesson Resource Route
app.delete('/api/mentor/resources/:id', authenticateToken, requireAdminOrMentor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const resource = await prisma.lessonResource.findUnique({
      where: { id }
    });

    if (!resource) {
      res.status(404).json({ error: 'Resource not found.' });
      return;
    }

    // Remove file from disk
    const fileName = path.basename(resource.filePath);
    const filePathOnDisk = path.resolve(UPLOADS_DIR, fileName);
    if (fs.existsSync(filePathOnDisk)) {
      fs.unlinkSync(filePathOnDisk);
    }

    // Remove from database
    await prisma.lessonResource.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Resource deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lesson resource.' });
  }
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'An unexpected database error has occurred on the server.' });
});

// Start Server if not running in a serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
}

export default app;

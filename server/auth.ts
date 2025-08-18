import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Request, Response, NextFunction } from 'express';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secure-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

// In-memory store for demo (replace with database in production)
const users: Map<string, User> = new Map();
const refreshTokens: Set<string> = new Set();

// Utility functions
export function generateTokens(user: Omit<User, 'passwordHash'>): AuthTokens {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

  refreshTokens.add(refreshToken);

  return { accessToken, refreshToken };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function validatePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    if (!refreshTokens.has(token)) {
      return null;
    }
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

export function revokeRefreshToken(token: string): void {
  refreshTokens.delete(token);
}

// User management functions
export function createUser(email: string, name: string, passwordHash: string, googleId?: string): User {
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name,
    passwordHash,
    googleId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.set(user.id, user);
  return user;
}

export function findUserByEmail(email: string): User | null {
  for (const [id, user] of users.entries()) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

export function findUserById(id: string): User | null {
  return users.get(id) || null;
}

export function findUserByGoogleId(googleId: string): User | null {
  for (const [id, user] of users.entries()) {
    if (user.googleId === googleId) {
      return user;
    }
  }
  return null;
}

// Middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  const user = findUserById(payload.userId);
  if (!user) {
    return res.status(403).json({ message: 'User not found' });
  }

  // Add user to request object
  (req as any).user = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  next();
}

// Auth route handlers
export async function handleSignup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = createUser(email, name, passwordHash);

    // Generate tokens
    const tokens = generateTokens(user);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password, rememberMe } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isValidPassword = await validatePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export function handleRefreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    const user = findUserById(payload.userId);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // Revoke old refresh token and generate new tokens
    revokeRefreshToken(refreshToken);
    const tokens = generateTokens(user);

    res.json(tokens);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export function handleLogout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export function handleProfile(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Google OAuth placeholder (would integrate with passport-google-oauth20 in production)
export function handleGoogleAuth(req: Request, res: Response) {
  // Redirect to Google OAuth
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
  const scope = 'openid email profile';
  
  if (!googleClientId) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `access_type=offline`;

  res.redirect(authUrl);
}

export async function handleGoogleCallback(req: Request, res: Response) {
  // This would handle the Google OAuth callback
  // For now, we'll simulate a successful Google login
  try {
    const mockGoogleUser = {
      id: 'google_' + Math.random().toString(36).substr(2, 9),
      email: 'user@gmail.com',
      name: 'Google User',
      googleId: 'google_123456789',
    };

    let user = findUserByGoogleId(mockGoogleUser.googleId);
    if (!user) {
      user = createUser(mockGoogleUser.email, mockGoogleUser.name, '', mockGoogleUser.googleId);
    }

    const tokens = generateTokens(user);
    
    // Redirect to frontend with tokens (in production, use secure session or redirect with success)
    res.redirect(`/?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('/?error=google_auth_failed');
  }
}
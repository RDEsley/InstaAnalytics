import { createMocks } from 'node-mocks-http';
import loginHandler from '../pages/api/auth/login';
import registerHandler from '../pages/api/auth/register';
import logoutHandler from '../pages/api/auth/logout';

// Mock Supabase
jest.mock('@/lib/auth', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Mock rate limiting
jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(() => false),
}));

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const { supabase } = require('@/lib/auth');
    
    // Mock successful login
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
          created_at: '2024-01-01T00:00:00Z',
        },
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_at: 1234567890,
        },
      },
      error: null,
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe('test@example.com');
  });

  it('should return error for invalid credentials', async () => {
    const { supabase } = require('@/lib/auth');
    
    // Mock failed login
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should return validation error for invalid email', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'invalid-email',
        password: 'password123',
      },
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation error');
  });

  it('should return method not allowed for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('Method not allowed');
  });
});

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register successfully with valid data', async () => {
    const { supabase } = require('@/lib/auth');
    
    // Mock successful registration
    supabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
          email: 'newuser@example.com',
          user_metadata: { full_name: 'New User' },
          created_at: '2024-01-01T00:00:00Z',
        },
      },
      error: null,
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fullName: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      },
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe('newuser@example.com');
  });

  it('should return error for existing user', async () => {
    const { supabase } = require('@/lib/auth');
    
    // Mock user already exists error
    supabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fullName: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      },
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(409);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('User already exists');
  });

  it('should return validation error for password mismatch', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
      },
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation error');
  });
});

describe('/api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should logout successfully with valid token', async () => {
    const { supabase } = require('@/lib/auth');
    
    // Mock successful logout
    supabase.auth.signOut.mockResolvedValue({
      error: null,
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    await logoutHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
  });

  it('should return error for missing token', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await logoutHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('No authorization token provided');
  });
});

// Integration tests
describe('Authentication Flow Integration', () => {
  it('should complete full registration and login flow', async () => {
    const { supabase } = require('@/lib/auth');
    
    // Mock successful registration
    supabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
          email: 'integration@example.com',
          user_metadata: { full_name: 'Integration User' },
          created_at: '2024-01-01T00:00:00Z',
        },
      },
      error: null,
    });

    // Register user
    const { req: registerReq, res: registerRes } = createMocks({
      method: 'POST',
      body: {
        fullName: 'Integration User',
        email: 'integration@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      },
    });

    await registerHandler(registerReq, registerRes);
    expect(registerRes._getStatusCode()).toBe(201);

    // Mock successful login
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
          email: 'integration@example.com',
          user_metadata: { full_name: 'Integration User' },
          created_at: '2024-01-01T00:00:00Z',
        },
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_at: 1234567890,
        },
      },
      error: null,
    });

    // Login user
    const { req: loginReq, res: loginRes } = createMocks({
      method: 'POST',
      body: {
        email: 'integration@example.com',
        password: 'password123',
      },
    });

    await loginHandler(loginReq, loginRes);
    expect(loginRes._getStatusCode()).toBe(200);

    const loginData = JSON.parse(loginRes._getData());
    expect(loginData.success).toBe(true);
    expect(loginData.data.user.email).toBe('integration@example.com');
  });
});
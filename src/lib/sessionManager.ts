// Simple in-memory session store (use Redis or database in production)
const sessions = new Map<string, { userId: string; userType: 'admin' | 'employee' | 'user'; email: string }>();

export const sessionManager = {
  create: (sessionToken: string, userId: string, userType: 'admin' | 'employee' | 'user', email: string) => {
    sessions.set(sessionToken, { userId, userType, email });
  },

  get: (sessionToken: string) => {
    return sessions.get(sessionToken);
  },

  delete: (sessionToken: string) => {
    sessions.delete(sessionToken);
  },

  cleanup: () => {
    // Clean up old sessions (implement TTL in production)
    sessions.clear();
  }
};
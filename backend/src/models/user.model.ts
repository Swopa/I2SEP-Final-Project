// backend/src/models/user.model.ts
export interface User {
  id: string;          // Will be a UUID
  email: string;
  passwordHash: string;
  createdAt: string;   // ISO 8601 date string
}

// Optional helper types you might have added:
// export type NewUser = Omit<User, 'id' | 'createdAt'>;
// export type UserProfile = Omit<User, 'passwordHash'>;
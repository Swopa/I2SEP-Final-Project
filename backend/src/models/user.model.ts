// backend/src/models/user.model.ts
export interface User {
  id: string;          // Will be a UUID
  email: string;
  passwordHash: string;
  createdAt: string;   // ISO 8601 date string
}

// Data needed to create a new user (before id and createdAt are assigned)
export type NewUser = Omit<User, 'id' | 'createdAt'>;

// Data to return to the client (omitting sensitive info like passwordHash)
export type UserProfile = Omit<User, 'passwordHash'>;
// Optional helper types you might have added:
// export type NewUser = Omit<User, 'id' | 'createdAt'>;
// export type UserProfile = Omit<User, 'passwordHash'>;
// backend/src/server.ts
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import sqlite3 from 'sqlite3'; // To type the 'db' variable
import { User, UserProfile } from './models/user.model'; // Import User and UserProfile
import { hashPassword, generateToken } from './utils/auth.utils'; // Import your auth utils
import { findUserByEmail, createUser } from './services/user.service'; // Import user service functions
import { comparePassword} from './utils/auth.utils';
import { v4 as uuidv4 } from 'uuid';




// Database related imports
import { getDbConnection, closeDbConnection, initializeUserTable } from './database';

// Model imports - These will be used more extensively as DB interactions are built
// import { User } from './models/user.model';
// import { Assignment } from './models/assignment.model';
// import { Note } from './models/note.model';
// import { Course } from './models/course.model'; // (To be created)

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// --- Global Middleware ---
app.use(cors());          // Enable CORS for all routes
app.use(express.json());  // Middleware to parse JSON request bodies

// --- Database Instance ---
// This will hold our database connection instance once initialized.
// Route handlers will use this 'db' variable to interact with the database.
let db: sqlite3.Database | null = null;

// --- API Endpoints ---

// Health-check endpoint (remains functional)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});

app.post('/auth/signup', async (req: Request, res: Response) => {
  if (!db) { // Ensure db instance is available
    return res.status(503).json({ message: 'Database service unavailable. Please try again later.' });
  }

  try {
    const { email, password } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    // Add more validation (e.g., email format, password strength) as needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (password.length < 6) { // Example: minimum password length
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }


    // 2. Check if user already exists
    const existingUser = await findUserByEmail(db, email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' }); // 409 Conflict
    }

    // 3. Hash the password
    const passwordHash = await hashPassword(password);

    // 4. Create new user in the database
    const newUser = await createUser(db, { email, passwordHash });

    // 5. Generate JWT
    // Ensure the object passed to generateToken matches Pick<User, 'id' | 'email'>
    const token = generateToken({ id: newUser.id, email: newUser.email });

    // 6. Respond (don't send back passwordHash)
    const userProfile: UserProfile = { // Use UserProfile type
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.createdAt,
    };

    res.status(201).json({ token, user: userProfile });

  } catch (error: any) { // Catch block with 'any' or 'unknown' for error
    if (error.message === 'EmailAlreadyExists') { // Custom error from createUser
        return res.status(409).json({ message: 'Email already in use.' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ message: 'An error occurred during signup.' });
  }
});


app.post('/auth/login', async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ message: 'Database service unavailable.' });
  }

  try {
    const { email, password } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 2. Find user by email
    const user = await findUserByEmail(db, email);
    if (!user) {
      // User not found - generic message for security (don't reveal if email exists or not)
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Compare password
    const isPasswordMatch = await comparePassword(password, user.passwordHash);
    if (!isPasswordMatch) {
      // Password does not match - generic message
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. Generate JWT
    // Ensure the object passed to generateToken matches Pick<User, 'id' | 'email'>
    const token = generateToken({ id: user.id, email: user.email });

    // 5. Respond
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.status(200).json({ token, user: userProfile });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

// TODO: Course endpoints (Task A10 stub, then full CRUD by Dev A/C) will be added here:
// app.post('/courses', ...);
// app.get('/courses', ...);

// TODO: Assignment endpoints (to be re-implemented by Dev C using 'db')
/*
app.get('/assignments', (req: Request, res: Response) => {
  // Example: if (!db) return res.status(503).send('Database not ready');
  // db.all("SELECT * FROM assignments WHERE userId = ?", [req.user.id], (err, rows) => {...});
  res.status(501).json({ message: 'Assignments GET Not Implemented with DB yet' });
});

app.post('/assignments', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Assignments POST Not Implemented with DB yet' });
});
*/

// TODO: Note endpoints (to be re-implemented by Dev C using 'db')
/*
app.get('/notes', (req: Request, res: Response) => {
  res.status(501).json({ message: 'Notes GET Not Implemented with DB yet' });
});

app.post('/notes', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Notes POST Not Implemented with DB yet' });
});
*/


// --- Server Startup Function ---
const startServer = async () => {
  let httpServer: ReturnType<typeof app.listen> | null = null; // To store the server instance

  try {
    // 1. Initialize Database Connection
    const establishedDb = await getDbConnection();
    // getDbConnection should throw an error if connection fails,
    // so if we reach here, establishedDb is a valid Database instance.
    db = establishedDb; // Assign to the module-scoped 'db' variable
    console.log('Database connection established successfully.');

    // 2. Initialize Database Schema (Create tables if they don't exist)
    //    The 'db' variable is guaranteed to be non-null here.
    await initializeUserTable(db);
    // TODO (in later tasks):
    // await initializeCourseTable(db);
    // await initializeAssignmentTable(db);
    // await initializeNoteTable(db);
    console.log('Database schema initialization routines completed (User table checked/created).');


    // 3. Start Listening for HTTP Requests
    httpServer = app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
      console.log('Available basic routes:');
      console.log('  GET  /health');
      // Add other routes to this log as they become functional
    });

    //shutdown logic
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        if (httpServer) {
          httpServer.close(async () => {
            console.log('HTTP server closed.');
            try {
                // closeDbConnection internally checks if dbInstance is set
                await closeDbConnection();
                console.log('Database connection closed due to server shutdown.');
            } catch (err) {
                console.error('Error closing database on shutdown:', err);
            } finally {
                process.exit(0); // Exit after attempting DB close
            }
          });
        } else {
            // If httpServer is somehow null (e.g., error before listen), just try to close DB and exit
            try {
                await closeDbConnection();
            } catch (err) {
                console.error('Error closing database on shutdown (no HTTP server):', err);
            } finally {
                process.exit(0);
            }
        }
      });
    });

  } catch (error) {
    console.error("Failed to start the server:", error);
    // Attempt to close DB if an error occurred after it was potentially opened.
    // The 'db' variable will be non-null if getDbConnection succeeded before the error.
    if (db) {
      try {
        await closeDbConnection();
        console.log('Database connection closed due to server startup failure.');
      } catch (closeErr) {
        console.error("Error closing DB on failed startup:", closeErr);
      }
    }
    process.exit(1); // Exit the process with an error code
  }
};

// --- Actually Start the Server ---
startServer();
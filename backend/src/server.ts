// backend/src/server.ts
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import sqlite3 from 'sqlite3'; // To type the 'db' variable


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

// TODO: Auth endpoints (Tasks A6, A7) will be added here:
// app.post('/auth/signup', ...);
// app.post('/auth/login', ...);

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
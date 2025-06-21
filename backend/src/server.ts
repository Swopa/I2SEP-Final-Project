// backend/src/server.ts
import express, { Express, Request, Response,  NextFunction } from "express";
import sqlite3 from "sqlite3"; // To type the 'db' variable
import { User, UserProfile } from "./models/user.model"; // Import User and UserProfile
import {
  hashPassword,
  generateToken,
  comparePassword,
} from "./utils/auth.utils"; // Import your auth utils
import { findUserByEmail, createUser } from "./services/user.service"; // Import user service functions
import { v4 as uuidv4 } from "uuid";
import { authenticateToken } from "./middleware/auth.middleware";
import { Course, NewCourseData } from "./models/course.model";
import {
  createCourseDb,
  getCoursesByUserIdDb,
  getCourseByIdAndUserIdDb,
  updateCourseTitleDb,
  deleteCourseDb,
} from "./services/course.service";

// Database related imports
import {
  getDbConnection,
  closeDbConnection,
  initializeUserTable,
  initializeCourseTable,
  initializeAssignmentTable,
} from "./database";

// Assignment related imports
import { Assignment, NewAssignmentData } from './models/assignment.model';
import { createAssignmentDb, getAssignmentsByUserIdDb } from './services/assignment.service';

import dotenv from 'dotenv';
dotenv.config();

import cors from "cors";

// Model imports - These will be used more extensively as DB interactions are built
// import { User } from './models/user.model';
// import { Assignment } from './models/assignment.model';
// import { Note } from './models/note.model';
// import { Course } from './models/course.model'; // (To be created)

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// --- Global Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request bodies




// Basic Request Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => { // Event emitted when response is sent
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler Caught:", err.stack || err); // Log the full error stack

  // Avoid sending detailed stack traces in production for security
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = (err as any).statusCode || 500; // Use error's status code or default to 500
  const message = (err as any).expose // For errors from 'http-errors' library or similar
                  ? err.message
                  : (isProduction && statusCode === 500 ? 'An unexpected internal server error occurred.' : err.message);

  res.status(statusCode).json({
    message: message,
    // Optionally include stack in development
    ...( !isProduction && { stack: err.stack } )
  });
});

// --- Database Instance ---
// This will hold our database connection instance once initialized.
// Route handlers will use this 'db' variable to interact with the database.
let db: sqlite3.Database | null = null;

// --- API Endpoints ---

// Health-check endpoint (remains functional)
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

// ------Sign up Endpoint
app.post("/auth/signup", async (req: Request, res: Response) => {
  if (!db) {
    // Ensure db instance is available
    return res.status(503).json({
      message: "Database service unavailable. Please try again later.",
    });
  }

  try {
    const { email, password } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    // Add more validation (e.g., email format, password strength) as needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (password.length < 6) {
      // Example: minimum password length
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    // 2. Check if user already exists
    const existingUser = await findUserByEmail(db, email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." }); // 409 Conflict
    }

    // 3. Hash the password
    const passwordHash = await hashPassword(password);

    // 4. Create new user in the database
    const newUser = await createUser(db, { email, passwordHash });

    // 5. Generate JWT
    // Ensure the object passed to generateToken matches Pick<User, 'id' | 'email'>
    const token = generateToken({ id: newUser.id, email: newUser.email });

    // 6. Respond (don't send back passwordHash)
    const userProfile: UserProfile = {
      // Use UserProfile type
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({ token, user: userProfile });
  } catch (error: any) {
    // Catch block with 'any' or 'unknown' for error
    if (error.message === "EmailAlreadyExists") {
      // Custom error from createUser
      return res.status(409).json({ message: "Email already in use." });
    }
    console.error("Signup error:", error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
});

//----- Log in Endpoint
app.post("/auth/login", async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ message: "Database service unavailable." });
  }

  try {
    const { email, password } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // 2. Find user by email
    const user = await findUserByEmail(db, email);
    if (!user) {
      // User not found - generic message for security (don't reveal if email exists or not)
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 3. Compare password
    const isPasswordMatch = await comparePassword(password, user.passwordHash);
    if (!isPasswordMatch) {
      // Password does not match - generic message
      return res.status(401).json({ message: "Invalid credentials." });
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
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login." });
  }
});

//----- Courses Endpoint

// POST /courses - Create a new course for the authenticated user
app.post("/courses", authenticateToken, async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ message: "Database service unavailable." });
  }
  if (!req.user) {
    // Should be populated by authenticateToken
    return res
      .status(401)
      .json({ message: "Unauthorized (user not found in request)." });
  }

  try {
    const { title } = req.body as NewCourseData; // Get title from request body

    // Basic Validation
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res
        .status(400)
        .json({
          message: "Course title is required and must be a non-empty string.",
        });
    }

    const userId = req.user.userId; // Get userId from the authenticated user (JWT payload)

    const newCourse = await createCourseDb(db, userId, { title });

    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    // Check for specific DB errors if needed, e.g., unique constraints on (userId, title) if you add them
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to create course.", error: error.message });
    } else {
      res
        .status(500)
        .json({
          message: "An unknown error occurred while creating the course.",
        });
    }
  }
});

// GET /courses - Retrieve all courses for the authenticated user
app.get("/courses", authenticateToken, async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ message: "Database service unavailable." });
  }
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized (user not found in request)." });
  }

  try {
    const userId = req.user.userId;
    const userCourses = await getCoursesByUserIdDb(db, userId);
    res.status(200).json(userCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to fetch courses.", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "An unknown error occurred while fetching courses." });
    }
  }
});

// GET /courses/:courseId - Retrieve a specific course for the authenticated user
app.get(
  "/courses/:courseId",
  authenticateToken,
  async (req: Request, res: Response) => {
    if (!db) {
      return res.status(503).json({ message: "Database service unavailable." });
    }
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." }); // Should not happen if authenticateToken works
    }

    try {
      const { courseId } = req.params;
      const userId = req.user.userId;

      const course = await getCourseByIdAndUserIdDb(db, courseId, userId);

      if (!course) {
        return res
          .status(404)
          .json({ message: "Course not found or access denied." });
      }

      res.status(200).json(course);
    } catch (error) {
      console.error(`Error fetching course ${req.params.courseId}:`, error);
      if (error instanceof Error) {
        res
          .status(500)
          .json({ message: "Failed to fetch course.", error: error.message });
      } else {
        res
          .status(500)
          .json({
            message: "An unknown error occurred while fetching the course.",
          });
      }
    }
  }
);

// PUT /courses/:courseId - Update a specific course for the authenticated user
app.put('/courses/:courseId', authenticateToken, async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ message: 'Database service unavailable.' });
  }
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    const { courseId } = req.params;
    const { title: newTitle } = req.body as { title: string }; // Expecting only title for update now
    const userId = req.user.userId;

    // Basic Validation for newTitle
    if (!newTitle || typeof newTitle !== 'string' || newTitle.trim() === '') {
      return res.status(400).json({ message: 'New course title is required and must be a non-empty string.' });
    }

    const updatedCourse = await updateCourseTitleDb(db, courseId, userId, newTitle);

    if (!updatedCourse) {
      // This means either the course wasn't found for that user, or no changes were made (e.g. title was the same)
      // For a PUT, if the resource doesn't exist for the user, 404 is appropriate.
      // If it exists but title is same, some might return 200 with old obj, or 304 Not Modified,
      // but for simplicity, if our service returns null, we'll assume not found/not owned.
      return res.status(404).json({ message: 'Course not found, not owned by user, or no changes made.' });
    }

    res.status(200).json(updatedCourse);

  } catch (error) {
    console.error(`Error updating course ${req.params.courseId}:`, error);
    if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to update course.', error: error.message });
    } else {
        res.status(500).json({ message: 'An unknown error occurred while updating the course.' });
    }
  }
});


// DELETE /courses/:courseId - Delete a specific course for the authenticated user
app.delete('/courses/:courseId', authenticateToken, async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ message: 'Database service unavailable.' });
  }
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const wasDeleted = await deleteCourseDb(db, courseId, userId);

    if (!wasDeleted) {
      // Course not found for that user or already deleted
      return res.status(404).json({ message: 'Course not found or access denied.' });
    }

    // Successfully deleted
    res.status(204).send(); // 204 No Content is typical for successful DELETE

  } catch (error) {
    console.error(`Error deleting course ${req.params.courseId}:`, error);
    if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to delete course.', error: error.message });
    } else {
        res.status(500).json({ message: 'An unknown error occurred while deleting the course.' });
    }
  }
});


// +++ Assignment API Endpoints +++

// POST /assignments - Create a new assignment for the authenticated user
app.post('/assignments', authenticateToken, async (req: Request, res: Response) => {
  if (!db) { return res.status(503).json({ message: 'Database service unavailable.' }); }
  if (!req.user) { return res.status(401).json({ message: 'Unauthorized.' }); }

  try {
    const assignmentData = req.body as NewAssignmentData;
    const userId = req.user.userId;

    // Basic Validation
    if (!assignmentData.title || typeof assignmentData.title !== 'string' || assignmentData.title.trim() === '') {
      return res.status(400).json({ message: 'Assignment title is required.' });
    }
    if (!assignmentData.dueDate || typeof assignmentData.dueDate !== 'string') { // Basic check
      return res.status(400).json({ message: 'Assignment dueDate is required and must be a string.' });
    }
    // Optional: More robust ISO date validation for dueDate
    // const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3}Z)?$/; // Example, adjust for milliseconds
    // if (!isoDatePattern.test(assignmentData.dueDate)) {
    //   return res.status(400).json({ message: 'dueDate must be a valid ISO 8601 date string (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ").' });
    // }


    // Ensure default status if not provided, matching NewAssignmentData and Assignment interface
    const dataToSave: NewAssignmentData & { status?: Assignment['status'] } = {
        ...assignmentData,
        status: assignmentData.status || 'pending'
    };


    const newAssignment = await createAssignmentDb(db, userId, dataToSave as NewAssignmentData); // Cast if needed after adding status

    res.status(201).json(newAssignment);

  } catch (error) {
    console.error('Error creating assignment:', error);
    if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to create assignment.', error: error.message });
    } else {
        res.status(500).json({ message: 'An unknown error occurred while creating the assignment.' });
    }
  }
});

// TODO: Note endpoints (to be re-implemented by Dev C using 'db')
/*
app.get('/notes', (req: Request, res: Response) => {
  res.status(501).json({ message: 'Notes GET Not Implemented with DB yet' });
});

app.post('/notes', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Notes POST Not Implemented with DB yet' });
});
*/

//------- End of Endpoints

// --- Server Startup Function ---
const startServer = async () => {
  let httpServer: ReturnType<typeof app.listen> | null = null; // To store the server instance

  try {
    // 1. Initialize Database Connection
    const establishedDb = await getDbConnection();
    // getDbConnection should throw an error if connection fails,
    // so if we reach here, establishedDb is a valid Database instance.
    db = establishedDb; // Assign to the module-scoped 'db' variable
    console.log("Database connection established successfully.");

    // 2. Initialize Database Schema (Create tables if they don't exist)
    //    The 'db' variable is guaranteed to be non-null here.
    await initializeUserTable(db);
    await initializeCourseTable(db);
    // TODO (in later tasks):
    // await initializeCourseTable(db);
    await initializeAssignmentTable(db);
    // await initializeNoteTable(db);
    console.log(
      "Database schema initialization routines completed (User table checked/created)."
    );

    // 3. Start Listening for HTTP Requests
    httpServer = app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
      console.log("Available basic routes:");
      console.log("  GET  /health");
      console.log("  POST /auth/signup");
      console.log("  POST /auth/login");
      console.log("  POST /courses (Protected)");
      console.log("  GET  /courses (Protected)");
      console.log('  POST /assignments (Protected)');
      // Add other routes to this log as they become functional
    });

    //shutdown logic
    const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        if (httpServer) {
          httpServer.close(async () => {
            console.log("HTTP server closed.");
            try {
              // closeDbConnection internally checks if dbInstance is set
              await closeDbConnection();
              console.log("Database connection closed due to server shutdown.");
            } catch (err) {
              console.error("Error closing database on shutdown:", err);
            } finally {
              process.exit(0); // Exit after attempting DB close
            }
          });
        } else {
          // If httpServer is somehow null (e.g., error before listen), just try to close DB and exit
          try {
            await closeDbConnection();
          } catch (err) {
            console.error(
              "Error closing database on shutdown (no HTTP server):",
              err
            );
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
        console.log(
          "Database connection closed due to server startup failure."
        );
      } catch (closeErr) {
        console.error("Error closing DB on failed startup:", closeErr);
      }
    }
    process.exit(1); // Exit the process with an error code
  }
};

/* ---- Testing for middleware
app.get('/api/test-protected', authenticateToken, (req: Request, res: Response) => {
  // If middleware passes, req.user will be populated
  res.json({
    message: 'Access to protected route granted!',
    user: req.user
  });
});
*/

// --- Actually Start the Server ---
startServer();

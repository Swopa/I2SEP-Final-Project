
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; 
import { Assignment } from './models/assignment.model'; 
import { readAssignmentsFromFile, writeAssignmentsToFile, readNotesFromFile, writeNotesToFile } from './fileStore'; 
import { Note } from './models/note.model';


const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors()); 
app.use(express.json()); // Middleware to parse JSON request bodies



// In-memory store for assignments, which will be synchronized with the file
let assignments: Assignment[] = [];

// Function to load assignments from file into the in-memory store
const initializeAssignments = async () => {
  try {
    assignments = await readAssignmentsFromFile();
    console.log(`Successfully loaded ${assignments.length} assignments from file.`);
  } catch (error) {
    console.error('Failed to initialize assignments from file:', error);
    // Decide if server should start with empty assignments or handle error differently
    assignments = [];
  }
};

let notes: Note[] = [];
const initializeNotes = async () => {
  try {
    notes = await readNotesFromFile();
    console.log(`Successfully loaded ${notes.length} notes from file.`);
  } catch (error) {
    console.error('Failed to initialize notes from file:', error);
    notes = [];
  }
};

// --- API Endpoints for Assignments ---

// GET /assignments - Retrieve all assignments
app.get('/assignments', (req: Request, res: Response) => {
  res.status(200).json(assignments);
});

// POST /assignments - Create a new assignment
app.post('/assignments', async (req: Request, res: Response) => {
  try {
    const { title, course, deadline } = req.body;

    // Basic validation
    if (!title || !course || !deadline) {
      return res.status(400).json({ message: 'Missing required fields: title, course, and deadline are required.' });
    }
    // More specific validation (e.g., deadline format) can be added here
    // For example, check if deadline is a valid ISO date string
    if (typeof title !== 'string' || typeof course !== 'string' || typeof deadline !== 'string') {
        return res.status(400).json({ message: 'Invalid data types for fields.' });
    }
    // Example: Basic ISO date string check (can be more robust)
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2}))$/;
    if (!isoDatePattern.test(deadline)) {
        return res.status(400).json({ message: 'Deadline must be a valid ISO 8601 date string (e.g., "2024-12-31T23:59:59.000Z").' });
    }


    const newAssignment: Assignment = {
      id: uuidv4(), // Generate a unique ID
      title,
      course,
      deadline,
    };

    assignments.push(newAssignment); // Add to in-memory array
    await writeAssignmentsToFile(assignments); // Persist the entire updated array to file

    res.status(201).json(newAssignment); // Respond with the created assignment
  } catch (error) {
    console.error('Error creating assignment:', error);
    // Check if it's a known error or a generic server error
    if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to create assignment.', error: error.message });
    } else {
        res.status(500).json({ message: 'Failed to create assignment due to an unknown error.' });
    }
  }
});

app.get('/notes', (req: Request, res: Response) => {
  res.status(200).json(notes);
});

// POST /notes - Create a new note
app.post('/notes', async (req: Request, res: Response) => {
  try {
    const { course, title, content, link } = req.body;

    // Basic validation
    if (!course || !title || !content) {
      return res.status(400).json({ message: 'Missing required fields: course, title, and content are required.' });
    }
    if (typeof course !== 'string' || typeof title !== 'string' || typeof content !== 'string') {
        return res.status(400).json({ message: 'Invalid data types for required note fields.' });
    }
    if (link && typeof link !== 'string') { // Validate link only if provided
        return res.status(400).json({ message: 'Invalid data type for link.' });
    }

    const newNote: Note = {
      id: uuidv4(),
      course,
      title,
      content,
      link: link || undefined, // Ensure link is undefined if not provided or empty
      createdAt: new Date().toISOString(), // Set creation timestamp
    };

    notes.push(newNote);
    await writeNotesToFile(notes); // Persist to notes.json

    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    if (error instanceof Error) {
        res.status(500).json({ message: 'Failed to create note.', error: error.message });
    } else {
        res.status(500).json({ message: 'Failed to create note due to an unknown error.' });
    }
  }
});

// --- Health-check endpoint 
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});


// Initialize assignments and then start listening
initializeAssignments().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('  GET  /health');
    console.log('  GET  /assignments');
    console.log('  POST /assignments');
    console.log('  GET  /notes');
    console.log('  POST /notes');
  });
}).catch(error => {
    console.error("Failed to start the server due to an error during initialization:", error);
    process.exit(1); // Exit if server can't initialize properly
});
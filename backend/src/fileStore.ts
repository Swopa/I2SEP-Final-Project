import fs from 'fs/promises'; 
import path from 'path';
import { Assignment } from './models/assignment.model'; 

// Determine the correct base path depending on execution context (ts-node vs. compiled)
// __dirname in a .ts file run by ts-node is the directory of the .ts file (e.g., backend/src)
// __dirname in a .js file run by node (after tsc) is the directory of the .js file (e.g., backend/dist)
const dataDir = path.join(__dirname, 'data'); // This will be 'src/data' or 'dist/data'
const assignmentsFilePath = path.join(dataDir, 'assignments.json');

// Helper function to ensure the data directory and file exist
const ensureDataFile = async (filePath: string): Promise<void> => {
  const dir = path.dirname(filePath);
  try {
    await fs.access(dir);
  } catch (error) {
    // Directory doesn't exist, create it
    console.log(`Data directory not found. Creating: ${dir}`);
    await fs.mkdir(dir, { recursive: true });
  }

  try {
    await fs.access(filePath);
  } catch (error) {
    // File doesn't exist, create it with an empty array
    console.log(`Data file not found. Creating with empty array: ${filePath}`);
    await fs.writeFile(filePath, JSON.stringify([]), 'utf8');
  }
};

// Function to read assignments from the JSON file
export const readAssignmentsFromFile = async (): Promise<Assignment[]> => {
  await ensureDataFile(assignmentsFilePath); // Ensure file exists before reading
  try {
    const fileContents = await fs.readFile(assignmentsFilePath, 'utf8');
    // Handle case where file might be empty (not valid JSON for parse)
    if (fileContents.trim() === '') {
        return [];
    }
    return JSON.parse(fileContents) as Assignment[];
  } catch (error) {
    console.error('Error reading assignments from file:', error);
    // If there's a critical error even after ensuring file exists, return empty or throw
    return [];
  }
};

// Function to write assignments to the JSON file
export const writeAssignmentsToFile = async (assignments: Assignment[]): Promise<void> => {
  await ensureDataFile(assignmentsFilePath); // Ensure directory exists before writing
  try {
    const jsonData = JSON.stringify(assignments, null, 2); 
    await fs.writeFile(assignmentsFilePath, jsonData, 'utf8');
  } catch (error) {
    console.error('Error writing assignments to file:', error);
  }
};
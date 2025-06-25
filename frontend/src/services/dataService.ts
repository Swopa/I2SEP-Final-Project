// frontend/src/services/dataService.ts

import type { Assignment, Note, Course } from '../types'; // Import your shared types

// Utility to simulate network delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Stubbed function to get a summary of upcoming assignments.
 * In a real app, this would hit a backend API endpoint.
 */
export const getDashboardAssignmentsSummary = async (): Promise<Assignment[]> => {
  console.log('DataService Stub: Fetching dashboard assignment summary...');
  await simulateDelay();

  // Return dummy data
  return [
    {
      id: 'dash-assign-1',
      title: 'Final Project Submission',
      course: 'I2SEP',
      deadline: '2025-06-15T23:59:59.000Z',
    },
    {
      id: 'dash-assign-2',
      title: 'Midterm Exam Study',
      course: 'Calculus I',
      deadline: '2025-06-08T09:00:00.000Z',
    },
    {
      id: 'dash-assign-3',
      title: 'Reading: Chapter 5',
      course: 'World History',
      deadline: '2025-06-05T17:00:00.000Z',
    },
  ];
};

/**
 * Stubbed function to get a summary of recent notes.
 * In a real app, this would hit a backend API endpoint.
 */
export const getDashboardNotesSummary = async (): Promise<Note[]> => {
  console.log('DataService Stub: Fetching dashboard notes summary...');
  await simulateDelay();

  

  // Return dummy data
  return [
    {
      id: 'dash-note-1',
      course: 'Programming I',
      title: 'React Hooks Cheatsheet',
      content: 'Important hooks: useState, useEffect, useContext. Remember dependency array!',
      createdAt: '2025-05-30T10:00:00.000Z',
      userId: 'dummy_user_id'
    },
    {
      id: 'dash-note-2',
      course: 'Biology 101',
      title: 'Mitochondria Function',
      content: 'Powerhouse of the cell. ATP synthesis. Cellular respiration.',
      link: 'https://en.wikipedia.org/wiki/Mitochondrion',
      createdAt: '2025-05-28T14:30:00.000Z',
      userId: 'dummy_user_id'
    },
  ];

  
};

export const getCourses = async (): Promise<Course[]> => {
  console.log('DataService Stub: Fetching courses...');
  await simulateDelay();

return [
    {
      id: 'course-1',
      userId: 'user-abc', // Dummy user ID
      title: 'Introduction to Programming (COMP 101)',
      createdAt: '2025-01-10T09:00:00.000Z',
    },
    {
      id: 'course-2',
      userId: 'user-abc',
      title: 'Calculus I (MATH 202)',
      createdAt: '2025-01-15T10:30:00.000Z',
    },
    {
      id: 'course-3',
      userId: 'user-xyz', // Another dummy user ID, just for example
      title: 'World History Since 1500 (HIST 301)',
      createdAt: '2025-02-01T11:00:00.000Z',
    },
    {
      id: 'course-4',
      userId: 'user-abc',
      title: 'Principles of Biology (BIO 101)',
      createdAt: '2025-02-05T13:00:00.000Z',
    }
  ];
};
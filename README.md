      
# 📚 Academic Hub

Your personal dashboard for schoolwork & notes.

## Table of Contents

-   [About the Project](#about-the-project)
-   [Features](#features)
-   [Technologies Used](#technologies-used)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Cloning the Repository](#cloning-the-repository)
    -   [Backend Setup](#backend-setup)
    -   [Frontend Setup](#frontend-setup)
    -   [Running the Application](#running-the-application)
-   [Usage](#usage)
-   [Current Limitations & Known Issues](#current-limitations--known-issues)
-   [Future Enhancements (Roadmap)](#future-enhancements-roadmap)
-   [License](#license)
-   [Contact](#contact)

## About the Project

Academic Hub is a basic full-stack web application designed to help students keep track of their academic responsibilities. It provides a personal dashboard where users can manage their assignments, keep study notes, and view their courses. The application emphasizes clear data structuring using TypeScript, a responsive React frontend, and a Node.js Express backend for data persistence and API management.

## Features

*   **User Authentication:** Secure user registration (`/signup`) and login (`/login`) with password hashing (backend) and JWT (JSON Web Tokens) for session management.
*   **Persistent Sessions:** Users remain logged in across browser sessions via JWT storage in `localStorage`.
*   **Protected Routes:** Core application features (Dashboard, Assignments, Notes, Courses) are accessible only to authenticated users.
*   **Assignment Management:**
    *   **Create:** Add new assignments with title, due date, course title, and optional description/status.
    *   **List:** View all assignments.
    *   **Edit:** Modify existing assignment details (title, description, due date, course title, status) via a modal.
    *   **Delete:** Remove assignments.
    *   **Persistence:** Assignments are stored in an SQLite database on the backend.
*   **Note Management (Frontend UI Only):**
    *   **Create:** Add new notes with course, title, content, and optional link.
    *   **List:** View all notes.
    *   **Edit:** Modify existing note details via a modal.
    *   **Delete:** Remove notes.
    *   **Persistence:** **Currently uses in-memory/stubbed data on the frontend.** Changes will *not* persist after a page refresh or server restart until backend integration is complete for notes.
*   **Course Listing:**
    *   **List:** View a list of courses.
    *   **Persistence:** Courses are stored in an SQLite database on the backend. (Currently, only a title can be stored/retrieved.)
*   **Dashboard Overview:** Provides a summary of upcoming assignments (from backend) and recent notes (currently stubbed).
*   **Global Loading Indicator:** A full-screen overlay with a spinner provides visual feedback during all API calls.
*   **Toast Notifications:** Non-intrusive pop-up messages provide immediate user feedback for successful operations and errors.
*   **Responsive User Interface:** The layout adapts for different screen sizes (desktop, tablet, mobile).
*   **Clean Navigation:** A persistent sidebar (when logged in) allows for easy navigation between main application sections.

## Technologies Used

This project is built with a modern full-stack JavaScript/TypeScript approach:

**Frontend:**
*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A superset of JavaScript that adds static typing.
*   **React Router DOM:** For declarative routing in React applications.
*   **Vite:** A fast and lightweight build tool for modern web projects.
*   **CSS:** For styling the application.
*   **Context API:** For global state management (Authentication, Loading, Toast notifications).

**Backend:**
*   **Node.js:** A JavaScript runtime environment.
*   **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
*   **TypeScript:** Ensures robust and type-safe backend code.
*   **SQLite3:** A lightweight, file-based SQL database (no separate database server needed).
*   **JSON Web Tokens (JWT):** For secure, stateless authentication.
*   **bcrypt:** For hashing user passwords securely.
*   **CORS:** Middleware for enabling Cross-Origin Resource Sharing.
*   **`uuid`:** For generating unique identifiers (UUIDs).
*   **`dotenv`:** For loading environment variables from a `.env` file.

## Project Structure

The repository is organized into two main directories: `frontend` and `backend`.

    

IGNORE_WHEN_COPYING_START
Use code with caution. Markdown
IGNORE_WHEN_COPYING_END

academic-organizer/
├── frontend/
│ ├── public/ # Static assets (like favicon.ico)
│ ├── src/
│ │ ├── components/ # Reusable UI components (e.g., Sidebar, Modals, LoadingOverlay, Toast)
│ │ ├── context/ # React Contexts (AuthContext, LoadingContext, ToastContext)
│ │ ├── pages/ # Main application views/pages (e.g., LoginPage, AssignmentsPage)
│ │ │ └── Auth/ # Authentication-specific pages
│ │ ├── services/ # Frontend API service modules (authService, assignmentService, dataService, noteService)
│ │ ├── utils/ # Utility functions (tokenStorage, apiClient)
│ │ ├── App.css # Global and component-specific styles
│ │ ├── App.tsx # Main application component and routing logic
│ │ ├── index.css # Minimal global CSS reset (should be nearly empty)
│ │ ├── main.tsx # Entry point for React application
│ │ └── types.ts # Shared TypeScript interfaces for frontend data models
│ ├── package.json # Frontend dependencies and scripts
│ └── tsconfig.json # TypeScript configuration for frontend
│
└── backend/
├── src/
│ ├── database.ts # SQLite database connection and table initialization
│ ├── models/ # TypeScript interfaces for database entities (User, Assignment, Note, Course)
│ ├── middleware/ # Express middleware (e.g., authentication)
│ ├── services/ # Business logic and database interaction functions
│ ├── utils/ # Utility functions (auth, password hashing, JWT generation)
│ └── server.ts # Main Express server setup and API routes
├── data/ # Directory where SQLite database file (e.g., app.db) will be stored
├── .env.example # Example environment variables file
├── package.json # Backend dependencies and scripts
└── tsconfig.json # TypeScript configuration for backend
Generated code

      
## Getting Started

Follow these steps to get your Academic Hub application up and running on your local machine.

### Prerequisites

*   **Node.js:** v18.x or higher (includes npm)
*   **Git:** For cloning the repository

### Cloning the Repository

First, clone the project repository from GitHub:

```bash
git clone <repository_url>
cd academic-organizer

    

IGNORE_WHEN_COPYING_START
Use code with caution.
IGNORE_WHEN_COPYING_END
Backend Setup

    Navigate to the backend directory:
    Generated bash

          
    cd backend

        

    IGNORE_WHEN_COPYING_START

Use code with caution. Bash
IGNORE_WHEN_COPYING_END

Install dependencies:
Generated bash

      
npm install

    

IGNORE_WHEN_COPYING_START
Use code with caution. Bash
IGNORE_WHEN_COPYING_END

Create .env file:
Create a file named .env in the backend/ directory. This file will store your environment variables. You can copy the content from .env.example:
Generated bash

      
cp .env.example .env

    

IGNORE_WHEN_COPYING_START
Use code with caution. Bash
IGNORE_WHEN_COPYING_END

Then open .env and set your JWT_SECRET. This should be a strong, random string. You can use an online generator or create one manually.
Generated dotenv

      
# backend/.env
PORT=3001
JWT_SECRET="your_very_strong_and_random_jwt_secret_key_here"

    

IGNORE_WHEN_COPYING_START

    Use code with caution. Dotenv
    IGNORE_WHEN_COPYING_END

    Initialize Database (on first run):
    The backend will automatically create the data/app.db file and initialize tables (users, courses, assignments) when the server starts for the first time.

Frontend Setup

    Navigate to the frontend directory:
    Generated bash

          
    cd ../frontend

        

    IGNORE_WHEN_COPYING_START

Use code with caution. Bash
IGNORE_WHEN_COPYING_END

Install dependencies:
Generated bash

      
npm install

    

IGNORE_WHEN_COPYING_START

    Use code with caution. Bash
    IGNORE_WHEN_COPYING_END

Running the Application

    Start the Backend Server:
    Open a new terminal window (keep the current one for the frontend).
    Navigate to the backend directory:
    Generated bash

          
    cd academic-organizer/backend
    npm run dev

        

    IGNORE_WHEN_COPYING_START

Use code with caution. Bash
IGNORE_WHEN_COPYING_END

You should see output indicating the server is running on http://localhost:3001.

Start the Frontend Development Server:
In your original terminal window (where you installed frontend dependencies), run:
Generated bash

      
npm run dev

    

IGNORE_WHEN_COPYING_START

    Use code with caution. Bash
    IGNORE_WHEN_COPYING_END

    This will start the React development server, usually on http://localhost:5173. Your browser should automatically open to this address.

Usage

    Signup:

        Upon first launch or if not logged in, you will be redirected to the /login page. Click the "Sign Up" link or navigate to http://localhost:5173/signup.

        Register a new account with an email and password.

        Upon successful registration, you will be automatically logged in and redirected to the Dashboard.

    Login:

        Navigate to http://localhost:5173/login.

        Log in with your registered email and password.

        Successful login redirects you to the Dashboard. Failed attempts will show an error.

    Navigation:

        Once logged in, a sidebar will appear on the left.

        Use the links in the sidebar (Dashboard, Assignments, Notes, Courses) to navigate between sections.

    Assignments (/assignments):

        Add: Use the form at the top to add new assignments.

        View: See a list of your assignments.

        Edit: Click the "Edit" button next to an assignment to open a modal and modify its details.

        Delete: Click the "Delete" button next to an assignment to confirm and remove it.

        All changes are saved to the backend's SQLite database.

    Notes (/notes):

        Add: Use the form at the top to add new notes.

        View: See a list of your notes.

        Edit: Click the "Edit" button next to a note to open a modal and modify its details.

        Delete: Click the "Delete" button next to a note to confirm and remove it.

        Important: Note data is currently only stored in the frontend's memory. If you refresh the page or restart the frontend server, any added/edited/deleted notes will be lost.

    Courses (/courses):

        View: See a list of dummy courses (currently only displaying title and createdAt as per backend model).

        Currently, there are no UI features to add, edit, or delete courses.

    Dashboard (/dashboard):

        Provides a quick overview of your upcoming assignments (fetched from backend) and recent notes (currently from frontend stub).

    Logout:

        Click the "Logout" button located at the bottom of the sidebar. This will clear your session and redirect you to the login page.

Current Limitations & Known Issues

    Course Management: No UI for adding, editing, or deleting courses yet.

    Dashboard Summaries: Only show a fixed number of items. No advanced filtering or customization.

    Error Handling: Basic alerts and console logs for errors. A more robust error display strategy could be implemented.

    Backend JWT Validation: Initial session persistence relies on checking for token presence. Real-world apps validate token expiry/authenticity on every protected API call.

    Mobile Responsiveness: Basic responsive adjustments are present, but might need further refinement for a seamless experience on all device sizes.

Future Enhancements (Roadmap)

    Complete Notes Backend Integration: Implement actual API endpoints for notes (Create, Read, Update, Delete) on the backend and connect the frontend to them for persistence.

    Course CRUD: Add UI and backend logic for creating, editing, and deleting courses.

    User Profile Management: Allow users to view/update their profile information.

    Filtering and Sorting: Add options to filter and sort assignments/notes/courses by various criteria (e.g., due date, course, status).

    Notifications: Implement overdue assignment notifications or reminders.

    Calendar View: A calendar integration to visualize assignments and deadlines.

    Improved Validation: More robust frontend and backend form validation.

    Theming: Dark mode or customizable themes.

    Testing: Implement unit and integration tests for both frontend and backend.

    Deployment: Instructions and scripts for deploying the application to a cloud platform.

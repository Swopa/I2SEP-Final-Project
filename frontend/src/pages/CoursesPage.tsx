// frontend/src/pages/CoursesPage.tsx

import React, { useState, useEffect } from 'react';
import '../App.css'; // Common styling
import type { Course } from '../types';
import { getCourses } from '../services/dataService';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);
  const [errorCourses, setErrorCourses] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoadingCourses(true);
      setErrorCourses(null);
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setErrorCourses('Failed to load courses. Please try again.');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <section className="courses-section section-card">
      <h2>Your Courses</h2>

      {isLoadingCourses ? (
        <p className="empty-message">Loading your course list...</p>
      ) : errorCourses ? (
        <p className="error-message">{errorCourses}</p>
      ) : courses.length === 0 ? (
        <p className="empty-message">No courses found. Add some to get started!</p>
      ) : (
        <ul className="item-list">
          {courses.map(course => (
            <li key={course.id} className="item-card course-card">
              <div className="item-header">
                {/* Display the course title */}
                <strong>{course.title}</strong>
                {/* You can still use item-tag if you want to display something else, like userId for now
                    or remove it if it doesn't fit the new model */}
                {/* <span className="item-tag">{course.userId}</span> */}
              </div>
              {/* Display created date instead of description */}
              <p className="item-meta">Added: {new Date(course.createdAt).toLocaleDateString()}</p>
              {/* Removed: <p className="item-content">{course.description}</p> */}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CoursesPage;
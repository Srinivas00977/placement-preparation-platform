import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import AssessmentPage from '@/pages/Assessment';
import AptitudePage from '@/pages/Aptitude';
import CodingPage from '@/pages/Coding';
import TechnicalPage from '@/pages/Technical';
import HrPrepPage from '@/pages/HrPrep';
import ResumePage from '@/pages/Resume';
import RoadmapPage from '@/pages/Roadmap';
import GoalsPage from '@/pages/Goals';
import CoursesPage from '@/pages/Courses';
import ProfilePage from '@/pages/Profile';
import Home from '@/pages/Home';
import { authService } from '@/services/authService';

// Protected Route Guard: Restricts dashboard and all preparation routes to authenticated users only
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Authenticated & Protected Preparation Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aptitude"
          element={
            <ProtectedRoute>
              <AptitudePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding"
          element={
            <ProtectedRoute>
              <CodingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technical"
          element={
            <ProtectedRoute>
              <TechnicalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr-prep"
          element={
            <ProtectedRoute>
              <HrPrepPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <RoadmapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

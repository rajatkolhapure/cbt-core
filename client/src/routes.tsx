import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

import Homepage from './pages/Homepage';
import HomeOverview from './pages/HomeOverview';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';
import QuestionBankPage from './pages/admin/QuestionBankPage';
import ExamManagementPage from './pages/admin/ExamManagementPage';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import ResultsAnalyticsPage from './pages/admin/ResultsAnalyticsPage';
import IntegrityLogsPage from './pages/admin/IntegrityLogsPage';
import LiveMonitoringPage from './pages/admin/LiveMonitoringPage';
import AssignTestPage from './pages/admin/AssignTestPage';

import StudentLayout from './components/layout/StudentLayout';
import ExamResultPage from './pages/student/ExamResultPage';
import ExamPage from './pages/exam/ExamPage';
import StudentDashboard from './pages/student/StudentDashboard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Route to / points to the new Space Cadet Homepage */}
      <Route path="/" element={<Homepage />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Dashboard route points to Space Cadet StudentDashboard */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/overview" element={<HomeOverview />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="live" element={<LiveMonitoringPage />} />
          <Route path="questions" element={<QuestionBankPage />} />
          <Route path="exams" element={<ExamManagementPage />} />
          <Route path="students" element={<StudentManagementPage />} />
          <Route path="assign-test" element={<AssignTestPage />} />
          <Route path="results" element={<ResultsAnalyticsPage />} />
          <Route path="integrity" element={<IntegrityLogsPage />} />
        </Route>
      </Route>

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute requiredRole="STUDENT" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Homepage />} />
          <Route path="results/:attemptId" element={<ExamResultPage />} />
        </Route>
        {/* Locked-down CBT Exam Interface without standard layout chrome */}
        <Route path="/exam/:examId" element={<ExamPage />} />
      </Route>

      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

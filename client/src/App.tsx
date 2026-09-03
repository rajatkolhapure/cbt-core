import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';
import QuestionBankPage from './pages/admin/QuestionBankPage';
import ExamManagementPage from './pages/admin/ExamManagementPage';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import ResultsAnalyticsPage from './pages/admin/ResultsAnalyticsPage';
import IntegrityLogsPage from './pages/admin/IntegrityLogsPage';
import LiveMonitoringPage from './pages/admin/LiveMonitoringPage';

import StudentLayout from './components/layout/StudentLayout';
import StudentDashboardPage from './pages/student/DashboardPage';
import ExamResultPage from './pages/student/ExamResultPage';

import ExamPage from './pages/exam/ExamPage';

// Root redirector based on authenticated user role
const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="live" element={<LiveMonitoringPage />} />
              <Route path="questions" element={<QuestionBankPage />} />
              <Route path="exams" element={<ExamManagementPage />} />
              <Route path="students" element={<StudentManagementPage />} />
              <Route path="results" element={<ResultsAnalyticsPage />} />
              <Route path="integrity" element={<IntegrityLogsPage />} />
            </Route>
          </Route>

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute requiredRole="STUDENT" />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="results/:attemptId" element={<ExamResultPage />} />
            </Route>
            {/* Locked-down CBT Exam Interface without standard layout chrome */}
            <Route path="/exam/:examId" element={<ExamPage />} />
          </Route>

          {/* Fallback for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

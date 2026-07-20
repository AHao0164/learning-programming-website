import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { Header } from './components/Header';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LearningPage } from './pages/LearningPage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';

import { AdminLayout } from '../layouts/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { CourseManager } from './pages/admin/CourseManager';
import { CourseBuilder } from './pages/admin/CourseBuilder';
import { UserManager } from './pages/admin/UserManager';
import { PaymentResultPage } from './pages/PaymentResultPage';

import '../styles/f8-theme.css';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';
import { Toaster } from './components/ui/sonner'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLearningPage = location.pathname.startsWith('/learning');
  const isEditor = location.pathname === '/editor';
  const isAuth = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdmin && <Header />}
      <div style={{ minHeight: isEditor ? 'auto' : 'calc(100vh - 400px)' }}>
          {children}
      </div>
      {!isEditor && !isAuth && !isLearningPage && !isAdmin && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <Router>

      <Toaster position='top-right' richColors />

      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage/>}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route element={<ProtectedRoute/>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learning/:slug" element={<LearningPage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/payment/success" element={<PaymentResultPage />} />
            <Route path="/payment/failed" element={<PaymentResultPage />} />
            <Route path="/payment/error" element={<PaymentResultPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route element={<AdminRoute/>}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="courses" element={<CourseManager />} />
                <Route path="courses/:courseId/builder" element={<CourseBuilder />} />
                <Route path="users" element={<UserManager />} />
            </Route>
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

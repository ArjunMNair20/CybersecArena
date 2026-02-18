import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CTF = lazy(() => import('./pages/CTF'));
const PhishHunt = lazy(() => import('./pages/PhishHunt'));
const CodeAndSecure = lazy(() => import('./pages/CodeAndSecure'));
const WeeklyChallenge = lazy(() => import('./pages/WeeklyChallenge'));
const AICyberQuizBotLanding = lazy(() => import('./pages/AICyberQuizBotLanding'));
const AICyberQuizBot = lazy(() => import('./pages/AICyberQuizBot'));
const AICyberQuizBotStructured = lazy(() => import('./pages/AICyberQuizBotStructured'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const NewsFeed = lazy(() => import('./pages/NewsFeed'));
const Steganography = lazy(() => import('./pages/Steganography'));
const Profile = lazy(() => import('./pages/Profile'));
const Tutorials = lazy(() => import('./pages/Tutorials'));
const ThreatRadar = lazy(() => import('./pages/CyberHealthAnalyzer'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ConfirmEmail = lazy(() => import('./pages/ConfirmEmail'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
);

// Root redirect component that checks authentication
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  // Always redirect to login page on root
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Root redirect to login */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Public Routes - Authentication Pages */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            
            {/* Protected Routes - Main Application */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="weekly-challenge" element={<WeeklyChallenge />} />
              <Route path="ctf" element={<CTF />} />
              <Route path="phish-hunt" element={<PhishHunt />} />
              <Route path="code-and-secure" element={<CodeAndSecure />} />
              <Route path="ai-quizbot" element={<AICyberQuizBotLanding />} />
              <Route path="ai-quizbot/:difficulty" element={<AICyberQuizBot />} />
              <Route path="ai-quiz" element={<AICyberQuizBotStructured />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="steganography" element={<Steganography />} />
              <Route path="threat-radar" element={<ThreatRadar />} />
              <Route path="news" element={<NewsFeed />} />
              <Route path="profile" element={<Profile />} />
              <Route path="tutorials" element={<Tutorials />} />
            </Route>
            
            {/* Catch all - redirect to login if not authenticated, or 404 for unknown routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

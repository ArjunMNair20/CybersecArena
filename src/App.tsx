import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Dashboard from './pages/Dashboard';
import CTF from './pages/CTF';
import PhishHunt from './pages/PhishHunt';
import CodeAndSecure from './pages/CodeAndSecure';
import FirewallDefender from './pages/FirewallDefender';
import AICyberQuizBot from './pages/AICyberQuizBot';
import ChatBot from './pages/ChatBot';
import Leaderboard from './pages/Leaderboard';
import NewsFeed from './pages/NewsFeed';
import Profile from './pages/Profile';
import Tutorials from './pages/Tutorials';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="ctf" element={<CTF />} />
            <Route path="phish-hunt" element={<PhishHunt />} />
            <Route path="code-and-secure" element={<CodeAndSecure />} />
            <Route path="firewall-defender" element={<FirewallDefender />} />
            <Route path="ai-quizbot" element={<AICyberQuizBot />} />
            <Route path="chatbot" element={<ChatBot />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="news" element={<NewsFeed />} />
            <Route path="profile" element={<Profile />} />
            <Route path="tutorials" element={<Tutorials />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

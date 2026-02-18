import { useEffect, useState } from 'react';
import { Trophy, Star, Zap, CheckCircle, ArrowRight, Award, Flame, Target } from 'lucide-react';

interface WeeklyCompletionSplashProps {
  weekNumber: number;
  nextWeekDate: string;
  onDismiss: () => void;
}

export function WeeklyCompletionSplash({
  weekNumber,
  nextWeekDate,
  onDismiss,
}: WeeklyCompletionSplashProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  // Generate confetti pieces
  useEffect(() => {
    const pieces = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setConfetti(pieces);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Animated Background Blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={handleDismiss}
      />

      {/* Confetti Animation */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 animate-pulse"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            animation: `fall ${2 + piece.delay}s linear forwards`,
            animationDelay: `${piece.delay}s`,
            background: `hsl(${Math.random() * 360}, 70%, 50%)`,
          }}
        />
      ))}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)); }
          50% { filter: drop-shadow(0 0 50px rgba(255, 215, 0, 1)); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Main Content Card - Desktop Optimized */}
      <div
        className="relative bg-gradient-to-br from-purple-900/98 via-slate-900/98 to-slate-900/98 border-2 border-purple-500/60 rounded-3xl md:p-16 p-8 max-w-6xl w-full shadow-2xl backdrop-blur-xl"
        style={{ animation: 'slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Glow Background Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-purple-600/30 to-transparent rounded-full blur-3xl -z-10" />

        {/* Main Grid Layout */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left Side - Trophy and Celebration */}
          <div className="flex flex-col items-center justify-start space-y-6">
            {/* Trophy Icon with Glow */}
            <div style={{ animation: 'bounce 1s ease-in-out infinite' }}>
              <div style={{ animation: 'glow 2.5s ease-in-out infinite' }}>
                <Trophy className="w-32 h-32 text-yellow-300" strokeWidth={1} />
              </div>
            </div>

            {/* Main Heading */}
            <div className="text-center space-y-2">
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
                LEGENDARY!
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-cyan-300">
                Week {weekNumber} Complete
              </p>
            </div>

            {/* Achievement Badges */}
            <div className="flex gap-4 mt-4 flex-wrap justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-full">
                <Trophy size={18} className="text-yellow-400" />
                <span className="text-yellow-300 font-semibold">Perfect Score</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/50 rounded-full">
                <Flame size={18} className="text-red-400" />
                <span className="text-red-300 font-semibold">On Fire!</span>
              </div>
            </div>
          </div>

          {/* Right Side - Stats and Details */}
          <div className="space-y-6">
            {/* Challenge Stats */}
            <div className="bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-400/40 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                <Target size={24} className="text-blue-400" />
                Your Achievements
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="text-slate-300 font-medium">Challenges Solved</span>
                  <span className="text-2xl font-bold text-green-400">20/20 ✓</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="text-slate-300 font-medium">Accuracy</span>
                  <span className="text-2xl font-bold text-cyan-400">100%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="text-slate-300 font-medium">Completion Time</span>
                  <span className="text-xl font-bold text-purple-400">Excellent</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300 font-medium flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" />
                    Bonus XP
                  </span>
                  <span className="text-2xl font-bold text-yellow-300">+50 XP</span>
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/40 rounded-2xl p-6 md:p-8">
              <p className="text-slate-200 italic text-center text-lg md:text-base leading-relaxed">
                "Exceptional performance! You've demonstrated mastery of cybersecurity fundamentals. Continue this momentum and you'll become an unstoppable security expert!"
              </p>
            </div>

            {/* Next Week Preview */}
            <div className="bg-gradient-to-r from-green-500/15 to-cyan-500/15 border border-green-400/40 rounded-2xl p-6 md:p-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Next Challenge</p>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">Week {weekNumber + 1}</p>
                <p className="text-green-300 font-medium mt-2 flex items-center gap-2">
                  <span className="block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Monday, {nextWeekDate}
                </p>
              </div>
              <ArrowRight size={32} className="text-green-400 hidden md:block" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8 mt-12" />

        {/* Action Buttons - Desktop Row */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center md:justify-end">
          <button
            onClick={handleDismiss}
            className="flex items-center justify-center gap-2 px-8 md:px-10 py-4 bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-600 transition-all duration-200 transform hover:scale-105 text-lg"
          >
            View Leaderboard
          </button>

          <button
            onClick={handleDismiss}
            className="flex items-center justify-center gap-2 px-8 md:px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
          >
            <span>Continue</span>
            <ArrowRight size={22} />
          </button>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-8 right-8 text-yellow-400 animate-bounce" style={{ animationDuration: '2s' }}>
          <Star size={28} className="drop-shadow-lg" />
        </div>
        <div className="absolute bottom-12 left-8 text-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Award size={24} className="drop-shadow-lg" />
        </div>
        <div className="absolute top-1/3 right-12 text-green-400 hidden md:block" style={{ animation: 'float 4s ease-in-out infinite' }}>
          <CheckCircle size={22} className="drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
}

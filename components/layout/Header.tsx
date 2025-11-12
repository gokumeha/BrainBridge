import React, { useState } from 'react';
import { View, User } from '../../types';
import { ICONS } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

interface HeaderProps {
  user: User;
  currentView: View;
  setCurrentView: (view: View) => void;
  onBack: () => void;
  canGoBack: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentView, setCurrentView, onBack, canGoBack, onLogout }) => {
  const [showProfilePreview, setShowProfilePreview] = useState(false);

  const navItems = [
    { view: View.Assistant, label: 'AI Assistant' },
    { view: View.Dashboard, label: 'Dashboard' },
    { view: View.Library, label: 'My Library' },
    { view: View.Analyzer, label: 'Assignment Analyzer' },
    { view: View.Leaderboard, label: 'Leaderboard' },
    { view: View.Pomodoro, label: 'Focus Timer' },
    { view: View.Analytics, label: 'Analytics' },
  ];

  return (
    <header className="flex items-center justify-between p-4 h-16 border-b border-gray-200 bg-white/80 backdrop-blur-lg shrink-0 z-20">
      {/* Left Side: Logo and Name */}
      <div className="flex items-center space-x-3">
        <AnimatePresence>
          {canGoBack && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
        <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V2M12 2H8a4 4 0 00-4 4v4a4 4 0 004 4h4zm0 0h4a4 4 0 004-4V6a4 4 0 00-4-4h-4" />
            </svg>
            </div>
            <span className="font-bold text-xl text-gray-900">BrainBridge</span>
        </div>
      </div>

      {/* Center: Navigation Links */}
      <nav className="hidden md:flex items-center space-x-2">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === item.view ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {item.label}
            {currentView === item.view && (
              <motion.div
                layoutId="header-active-pill"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Right Side: Profile */}
      <div
        className="relative"
        onMouseEnter={() => setShowProfilePreview(true)}
        onMouseLeave={() => setShowProfilePreview(false)}
      >
        <button
          onClick={() => setCurrentView(View.Profile)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-gray-100 text-blue-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500"
          aria-label="Open Profile"
        >
          {ICONS[View.Profile]}
        </button>
        <AnimatePresence>
          {showProfilePreview && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full right-0 mt-2 w-64 bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-xl shadow-2xl z-20 p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  {ICONS[View.Profile]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Points</span>
                  <span className="font-semibold text-blue-600">{user.progress.points} ✨</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quizzes Taken</span>
                  <span className="font-semibold text-sky-600">{user.progress.quizzesTaken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Focus Sessions</span>
                  <span className="font-semibold text-green-600">{user.progress.pomodoroSessions}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3">
                <Button variant="secondary" onClick={onLogout} className="w-full text-sm">
                    Log Out & Go to Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
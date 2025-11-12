import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Source, User } from './types';
import Header from './components/layout/Header';
import AssistantView from './components/assistant/AssistantView';
import DashboardView from './components/dashboard/DashboardView';
import LibraryView from './components/library/LibraryView';
import PomodoroTimer from './components/pomodoro/PomodoroTimer';
import AnalyticsView from './components/analytics/AnalyticsView';
import ProfileView from './components/profile/ProfileView';
import LoginView from './components/auth/LoginView';
import SignUpView from './components/auth/SignUpView';
import AddSourceModal from './components/library/AddSourceModal';
import LandingPageView from './components/auth/LandingPageView';
import LeaderboardView from './components/leaderboard/LeaderboardView';
import AssignmentAnalyzerView from './components/analyzer/AssignmentAnalyzerView';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './services/firebase/config';
import * as firestoreService from './services/firebase/firestore';
import * as authService from './services/firebase/auth';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const WORK_MINS = 25;
const SHORT_BREAK_MINS = 5;
const LONG_BREAK_MINS = 15;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Assistant);
  const [viewHistory, setViewHistory] = useState<View[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState<boolean>(false);
  
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  
  const [activeSource, setActiveSource] = useState<Source | null>(null);

  const isAuthenticated = !!currentUser;

  // Listen to auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in. Fetch their data from Firestore.
        const userData = await firestoreService.getUserData(firebaseUser.uid);
        if (userData) {
          setCurrentUser(userData);
          setCurrentView(View.Assistant);
        } else {
          // This case might happen if firestore doc creation failed after signup
          console.error("User is authenticated but no data found in Firestore.");
          await authService.logOut(); // Log out to handle inconsistent state
          setCurrentUser(null);
        }
      } else {
        // User is signed out.
        setCurrentUser(null);
        setCurrentView(View.Assistant);
        setViewHistory([]);
        setActiveSource(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);
  
  const addPoints = useCallback(async (amount: number) => {
    if (!currentUser) return;
    const newPoints = currentUser.progress.points + amount;
    await firestoreService.updateUserProgress(currentUser.id, { points: newPoints });
    setCurrentUser(prev => prev ? {...prev, progress: {...prev.progress, points: newPoints}} : null);
  }, [currentUser]);
  
  const completePomodoroSession = useCallback(async () => {
    if (!currentUser) return;
    const newProgress = {
        points: currentUser.progress.points + 25,
        pomodoroSessions: currentUser.progress.pomodoroSessions + 1
    };
    await firestoreService.updateUserProgress(currentUser.id, newProgress);
    setCurrentUser(prev => prev ? {...prev, progress: {...prev.progress, ...newProgress}} : null);
  }, [currentUser]);

  const completeQuiz = useCallback(async (subject: string, score: number) => {
    if (!currentUser) return;
    const newQuizScore = { subject, score, date: new Date() };
    const newProgress = {
        points: currentUser.progress.points + score,
        quizzesTaken: currentUser.progress.quizzesTaken + 1,
        quizScores: [...currentUser.progress.quizScores, newQuizScore]
    };
    await firestoreService.updateUserProgress(currentUser.id, newProgress);
    setCurrentUser(prev => prev ? {...prev, progress: {...prev.progress, ...newProgress}} : null);
  }, [currentUser]);
  
  const handleClearData = useCallback(async () => {
    if (currentUser) {
        try {
            await firestoreService.deleteUserData(currentUser.id);
            await authService.deleteCurrentUserAccount();
            // onAuthStateChanged listener will handle state cleanup automatically
        } catch (error) {
            console.error("Error deleting user account:", error);
            alert("There was an error deleting your account. Please log out and log in again before retrying.");
        }
    }
  }, [currentUser]);
  
  const handleLogout = useCallback(async () => {
    try {
        await authService.logOut();
        // onAuthStateChanged listener will handle state cleanup
    } catch (error) {
        console.error("Error logging out:", error);
    }
  }, []);

  const handleSourceAdded = async (newSource: Source) => {
    if (!currentUser) return;
    const newSources = [newSource, ...currentUser.sources];
    await firestoreService.updateUserSources(currentUser.id, newSources);
    setCurrentUser(prev => prev ? { ...prev, sources: newSources } : null);
    handleSetView(View.Library);
    setIsAddSourceModalOpen(false);
  };
  
  const setSources = async (newSources: Source[] | ((prevSources: Source[]) => Source[])) => {
      if (!currentUser) return;
      const updatedSources = typeof newSources === 'function' ? newSources(currentUser.sources) : newSources;
      await firestoreService.updateUserSources(currentUser.id, updatedSources);
      setCurrentUser(prev => prev ? { ...prev, sources: updatedSources } : null);
  };

  // --- Pomodoro State & Logic (remains mostly the same, but tied to the app component) ---
  const [pomodoroMode, setPomodoroMode] = useState<TimerMode>('work');
  const [pomodoroTime, setPomodoroTime] = useState(WORK_MINS * 60);
  const [pomodoroIsActive, setPomodoroIsActive] = useState(false);
  const [pomodoroCycles, setPomodoroCycles] = useState(0);
  const pomodoroIntervalRef = useRef<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => { if ('Notification' in window) setNotificationPermission(Notification.permission); }, []);

  useEffect(() => {
    if (pomodoroIsActive) {
      pomodoroIntervalRef.current = window.setInterval(() => setPomodoroTime(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    } else if (!pomodoroIsActive && pomodoroIntervalRef.current) {
      clearInterval(pomodoroIntervalRef.current);
    }
    return () => { if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); };
  }, [pomodoroIsActive]);

  useEffect(() => {
    if (pomodoroTime <= 0) {
      if (notificationPermission === 'granted') {
        const title = pomodoroMode === 'work' ? 'Work session over!' : "Break's over!";
        const body = pomodoroMode === 'work' ? 'Time for a short break.' : 'Time to get back to focus!';
        new Notification(title, { body });
      }
      if (pomodoroMode === 'work') {
        completePomodoroSession();
        const newCycles = pomodoroCycles + 1;
        setPomodoroCycles(newCycles);
        setPomodoroMode(newCycles % 4 === 0 ? 'longBreak' : 'shortBreak');
      } else {
        setPomodoroMode('work');
      }
    }
  }, [pomodoroTime, pomodoroMode, pomodoroCycles, completePomodoroSession, notificationPermission]);

  useEffect(() => {
    let newTime;
    if (pomodoroMode === 'work') newTime = WORK_MINS * 60;
    else if (pomodoroMode === 'shortBreak') newTime = SHORT_BREAK_MINS * 60;
    else newTime = LONG_BREAK_MINS * 60;
    setPomodoroTime(newTime);
  }, [pomodoroMode]);

  const togglePomodoro = useCallback(() => setPomodoroIsActive(prev => !prev), []);
  const resetPomodoro = useCallback(() => {
    if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current);
    setPomodoroIsActive(false);
    setPomodoroMode('work');
    setPomodoroCycles(0);
  }, []);
  
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  }, []);
  
  const handleSetView = (view: View) => {
    if (view !== currentView) {
      setViewHistory(prev => [...prev, currentView]);
      setActiveSource(null);
      setCurrentView(view);
    }
  };

  const handleBack = () => {
    if (viewHistory.length > 0) {
      const previousView = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setActiveSource(null);
      setCurrentView(previousView);
    }
  };
  
  const pomodoroMinutes = Math.floor(pomodoroTime / 60).toString().padStart(2, '0');
  const pomodoroSeconds = (pomodoroTime % 60).toString().padStart(2, '0');

  const renderView = () => {
    if (!currentUser) return null; // Should not happen if authenticated

    if (activeSource) {
      return <LibraryView
                sources={currentUser.sources}
                setSources={setSources}
                activeSource={activeSource}
                setActiveSource={setActiveSource}
                onQuizComplete={completeQuiz}
                addPoints={addPoints}
                onAddNewSource={() => setIsAddSourceModalOpen(true)}
             />
    }

    switch (currentView) {
      case View.Assistant:
        return <AssistantView />;
      case View.Dashboard:
        return <DashboardView 
                  user={currentUser}
                  setActiveSource={setActiveSource} 
                  setCurrentView={handleSetView} 
                  onAddNewSource={() => setIsAddSourceModalOpen(true)}
                />;
      case View.Library:
        return <LibraryView 
                  sources={currentUser.sources} 
                  setSources={setSources} 
                  activeSource={activeSource} 
                  setActiveSource={setActiveSource}
                  onQuizComplete={completeQuiz}
                  addPoints={addPoints}
                  onAddNewSource={() => setIsAddSourceModalOpen(true)}
               />;
      case View.Leaderboard:
        return <LeaderboardView currentUser={currentUser} />;
      case View.Analyzer: // Add new case for Analyzer
        return <AssignmentAnalyzerView />;
      case View.Pomodoro:
        return <PomodoroTimer 
          mode={pomodoroMode} time={pomodoroTime} isActive={pomodoroIsActive}
          cycles={pomodoroCycles} onToggle={togglePomodoro} onReset={resetPomodoro}
          notificationPermission={notificationPermission as NotificationPermission}
          onRequestNotificationPermission={requestNotificationPermission}
        />;
      case View.Analytics:
        return <AnalyticsView progress={currentUser.progress} />;
      case View.Profile:
        return <ProfileView user={currentUser} onLogout={handleLogout} onClearData={handleClearData} />;
      default:
        return <AssistantView />;
    }
  };
  
  if (!isAuthenticated || !currentUser) {
    return (
        <>
            <LandingPageView
                onLoginClick={() => setIsLoginModalOpen(true)}
                onSignUpClick={() => setIsSignUpModalOpen(true)}
            />
            <LoginView
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onNavigateToSignUp={() => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); }}
            />
            <SignUpView
                isOpen={isSignUpModalOpen}
                onClose={() => setIsSignUpModalOpen(false)}
                onNavigateToLogin={() => { setIsSignUpModalOpen(false); setIsLoginModalOpen(true); }}
            />
        </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-gray-800 font-sans">
      <Header 
        currentView={currentView} 
        setCurrentView={handleSetView}
        user={currentUser}
        onBack={handleBack}
        canGoBack={viewHistory.length > 0}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto bg-white">
         <AnimatePresence mode="wait">
          <motion.div
            key={activeSource ? activeSource.id : currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
       <AddSourceModal 
          isOpen={isAddSourceModalOpen}
          onClose={() => setIsAddSourceModalOpen(false)}
          onSourceAdded={handleSourceAdded}
        />
        {/* Floating Pomodoro Timer */}
        <AnimatePresence>
            {pomodoroIsActive && currentView !== View.Pomodoro && (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="fixed bottom-6 right-6 z-30"
            >
                <button
                onClick={() => handleSetView(View.Pomodoro)}
                className="flex items-center space-x-3 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-200/80 hover:shadow-xl hover:scale-105 transition-all"
                >
                <span className="text-xl animate-pulse">⏱️</span>
                <span className="font-mono font-bold text-lg text-gray-900">{pomodoroMinutes}:{pomodoroSeconds}</span>
                </button>
            </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { logIn, signInWithGoogle } from '../../services/firebase/auth';

interface LoginViewProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSignUp: () => void;
}

const SocialButton: React.FC<{ icon: React.ReactNode, children: React.ReactNode, onClick?: () => void }> = ({ icon, children, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
    <div className="w-5 h-5 mr-3">{icon}</div>
    <span className="font-semibold text-gray-700">{children}</span>
  </button>
);

const LoginView: React.FC<LoginViewProps> = ({ isOpen, onClose, onNavigateToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await logIn(email, password);
      // onLoginSuccess is no longer needed. App.tsx's onAuthStateChanged will handle it.
      onClose();
    } catch (error: any) {
      setError("Failed to log in. Please check your credentials.");
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
      // The onAuthStateChanged listener in App.tsx will handle the successful login.
      onClose();
    } catch (error: any) {
      // Don't show an error if the user just closes the popup.
      if (error.code !== 'auth/popup-closed-by-user') {
        setError("Failed to sign in with Google. Please try again.");
      }
      console.error(error);
    }
  };
  
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full"
          >
            <Card className="max-w-md w-full mx-auto">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
                <p className="text-gray-500">Log in to continue your learning journey.</p>
              </div>

              <div className="space-y-4 mb-6">
                <SocialButton onClick={handleGoogleSignIn} icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.228 0-9.654-3.556-11.144-8.396l-6.571 4.819C9.656 40.663 16.318 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l6.19 5.238C42.011 35.638 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>}>Continue with Google</SocialButton>
              </div>

              <div className="flex items-center my-6">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="mx-4 text-xs font-semibold text-gray-500">OR</span>
                <hr className="flex-grow border-t border-gray-300" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button type="submit" className="w-full">
                  Log In
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <button onClick={onNavigateToSignUp} className="font-semibold text-blue-600 hover:underline focus:outline-none">
                    Sign Up
                  </button>
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginView;
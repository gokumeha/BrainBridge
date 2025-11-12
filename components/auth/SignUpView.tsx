import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { signUp } from '../../services/firebase/auth';

interface SignUpViewProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToLogin: () => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ isOpen, onClose, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    
    if (!/\d/.test(password)) {
        setError('Password must contain at least one number.');
        return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setError('Password must contain at least one special symbol.');
        return;
    }

    try {
      await signUp(name, email, password);
      // onSignUpSuccess is no longer needed. App.tsx's onAuthStateChanged will handle it.
      onClose();
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      console.error(error);
    }
  };

  const handleClose = () => {
    setName('');
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
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
                <p className="text-gray-500">Start your personalized learning experience.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                    required
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email-signup"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    id="password-signup"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                    required
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button onClick={onNavigateToLogin} className="font-semibold text-blue-600 hover:underline focus:outline-none">
                    Log In
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

export default SignUpView;
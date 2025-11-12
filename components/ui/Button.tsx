import React from 'react';
import { motion } from 'framer-motion';

// FIX: The ButtonProps interface was extending React.ButtonHTMLAttributes which caused a type conflict
// with framer-motion's props for motion.button. It has been updated to extend React.ComponentProps<typeof motion.button>
// to correctly type props for a motion component.
interface ButtonProps extends React.ComponentProps<typeof motion.button> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white shadow-md';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400 disabled:bg-gray-100',
    ghost: 'bg-transparent hover:bg-blue-100 text-blue-600 focus:ring-blue-500 disabled:text-gray-400 shadow-none',
  };

  return (
    <motion.button
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-800 mb-1 ml-1">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-600'} focus:outline-none focus:ring-2 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 ml-1">{error}</p>}
    </div>
  );
};
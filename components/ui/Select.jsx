import React from 'react';
import { colors, spacing, borderRadius, transitions } from '../../styles/designSystem';

const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  disabled = false,
  helperText = '', 
  error = '',
  className = '',
  ...props 
}) => {
  const baseClasses = `
    w-full px-3 py-2 border rounded-md 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-colors duration-200
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={baseClasses.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {(helperText || error) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select;
import { components } from '../../styles/designSystem';

const Input = ({ 
  label,
  id,
  type = 'text',
  size = 'md',
  state = 'normal',
  className = '',
  error,
  helperText,
  required = false,
  ...props 
}) => {
  const baseClasses = components.input.base;
  const sizeClasses = components.input.sizes[size];
  const stateClasses = state !== 'normal' ? components.input.states[state] : '';
  
  const combinedClasses = `${baseClasses} ${sizeClasses} ${stateClasses} ${className}`.trim();
  
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        className={combinedClasses}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
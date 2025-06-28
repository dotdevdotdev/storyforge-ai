import { components } from '../../styles/designSystem';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const baseClasses = components.button.base;
  const sizeClasses = components.button.sizes[size];
  const variantClasses = components.button.variants[variant];
  
  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${className}`.trim();
  
  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
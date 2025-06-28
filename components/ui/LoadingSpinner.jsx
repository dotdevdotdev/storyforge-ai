const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue',
  className = '',
  text = null 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };
  
  const colors = {
    blue: 'border-blue-500',
    gray: 'border-gray-500',
    white: 'border-white',
  };
  
  const spinnerClasses = `animate-spin rounded-full border-2 border-t-transparent ${sizes[size]} ${colors[color]} ${className}`.trim();
  
  if (text) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className={spinnerClasses}></div>
        <div className="text-gray-600 text-center mt-4">
          <p className="mb-2">{text}</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }
  
  return <div className={spinnerClasses}></div>;
};

export default LoadingSpinner;
import { components } from '../../styles/designSystem';

const Card = ({ 
  children, 
  padding = 'md', 
  className = '', 
  hoverable = false,
  onClick,
  ...props 
}) => {
  const baseClasses = components.card.base;
  const paddingClasses = components.card.padding[padding];
  const hoverClasses = hoverable || onClick ? components.card.hover : '';
  const cursorClasses = onClick ? 'cursor-pointer' : '';
  
  const combinedClasses = `${baseClasses} ${paddingClasses} ${hoverClasses} ${cursorClasses} ${className}`.trim();
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
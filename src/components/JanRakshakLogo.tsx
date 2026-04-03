import React from 'react';

interface JanRakshakLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'gradient';
}

const JanRakshakLogo: React.FC<JanRakshakLogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'default' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const getFilter = () => {
    switch (variant) {
      case 'white':
        return 'brightness(0) invert(1)';
      case 'gradient':
        return 'none';
      default:
        return 'none';
    }
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src="/favicon.svg"
        alt="JanRakshak Logo"
        className="w-full h-full"
        style={{ filter: getFilter() }}
      />
    </div>
  );
};

export default JanRakshakLogo;
import React from 'react';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        {showLogo && (
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="/favicon.svg" 
                alt="JanRakshak Logo" 
                className="w-16 h-16 animate-pulse"
              />
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">JanRakshak</h2>
          <p className="text-gray-600">{message}</p>
        </div>
        
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
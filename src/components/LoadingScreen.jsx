import React from 'react';

const LoadingScreen = ({ message = "Loading...", themeColor = null }) => {
  const customStyle = themeColor ? { borderColor: themeColor, backgroundColor: themeColor } : {};
  const textStyle = themeColor ? { color: themeColor } : {};
  const spinnerStyle = themeColor ? { borderTopColor: themeColor, borderRightColor: themeColor } : {};

  return (
    <div className="min-h-[400px] h-full w-full flex flex-col items-center justify-center p-8 bg-transparent">
      <div className="relative w-24 h-24 mb-8">
        {/* Outer pulsing ring */}
        <div 
          className={`absolute inset-0 rounded-full border-4 ${!themeColor ? 'border-crmAccent/20' : 'opacity-20'} animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]`}
          style={themeColor ? { borderColor: themeColor } : {}}
        ></div>
        {/* Inner spinning broken ring */}
        <div 
          className={`absolute inset-0 rounded-full border-4 border-transparent ${!themeColor ? 'border-t-crmAccent border-r-crmAccent' : ''} animate-spin`}
          style={spinnerStyle}
        ></div>
        {/* Center dot */}
        <div 
          className={`absolute inset-0 m-auto w-6 h-6 rounded-full ${!themeColor ? 'bg-crmAccent' : ''} animate-pulse shadow-lg`}
          style={themeColor ? { backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}` } : {}}
        ></div>
      </div>
      <h2 
        className={`text-sm font-bold tracking-[0.3em] uppercase animate-pulse ${!themeColor ? 'text-gray-800 dark:text-gray-200' : ''}`}
        style={textStyle}
      >
        {message}
      </h2>
    </div>
  );
};

export default LoadingScreen;

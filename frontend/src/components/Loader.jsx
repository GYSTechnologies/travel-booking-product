import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative">
        
        {/* Main rotating ring */}
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-emerald-500 rounded-full animate-ping"></div>
        </div>
        
        {/* Outer subtle ring */}
        <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border border-emerald-100 rounded-full animate-pulse -m-2"></div>
        
      </div>
    </div>
  );
};

export default Loader;
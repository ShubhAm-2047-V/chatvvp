import React from 'react';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--surface)]">
      {/* Cloud Blur Background */}
      <div className="cloud-bg-container">
        <div className="cloud-blob blob-1"></div>
        <div className="cloud-blob blob-2"></div>
        <div className="cloud-blob blob-3"></div>
        <div className="cloud-blob blob-4"></div>
        <div className="bg-overlay-noise"></div>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;

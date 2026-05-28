import React from 'react';

const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <div className="w-10 h-10 border-4 border-dark-200 dark:border-dark-700 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-sm text-dark-500 dark:text-dark-400">{text}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">{spinner}</div>;
  }

  return spinner;
};

export default LoadingSpinner;
import React from "react";

const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="size-32 animate-spin rounded-full border-y-2 border-blue-500"></div>
  </div>
);

const LoadingPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <LoadingSpinner />
      <h2 className="mt-4 text-2xl font-semibold text-gray-700">Loading...</h2>
    </div>
  );
};

export default LoadingPage;

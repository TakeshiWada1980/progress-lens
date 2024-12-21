import React from "react";
const LoadingPage = () => {
  return (
    <div className="flex min-h-screen -translate-y-32 flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative m-auto h-10 w-[82px] -translate-x-6">
          <div className="absolute left-[21px] top-0 size-10 animate-cube bg-indigo-600" />
          <div className="absolute left-[21px] top-0 size-10 animate-cube-delayed bg-indigo-400" />
        </div>
        <div className="mt-24 text-2xl font-semibold tracking-wide text-gray-700">
          NOW LOADING
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;

import React from "react";
const LoadingPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center -translate-y-32">
      <div className="flex flex-col items-center">
        <div className="relative m-auto h-10 w-[82px] -translate-x-6">
          <style>
            {`
            @keyframes cubemove {
              25% { transform: translateX(42px) rotate(-90deg) scale(0.5) }
              50% { transform: translateX(42px) translateY(42px) rotate(-179deg) }
              50.1% { transform: translateX(42px) translateY(42px) rotate(-180deg) }
              75% { transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5) }
              100% { transform: rotate(-360deg) }
            }
            .cube { animation: cubemove 1.8s infinite ease-in-out; }
            .cube2 { animation-delay: -0.9s; }
          `}
          </style>
          <div className="cube absolute left-[21px] top-0 h-10 w-10 bg-indigo-600" />
          <div className="cube cube2 absolute left-[21px] top-0 h-10 w-10 bg-indigo-400" />
        </div>
        <div className="mt-24 text-2xl font-semibold tracking-wide text-gray-700">
          NOW LOADING
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;

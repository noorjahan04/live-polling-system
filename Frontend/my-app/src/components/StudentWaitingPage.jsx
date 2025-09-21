
import React from "react";
import { SparklesIcon } from "@heroicons/react/24/solid";

function StudentWaitingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
      {/* Top Badge */}
      <div className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white px-4 py-1 rounded-full mb-6 text-sm font-medium shadow inline-flex items-center gap-1">
        <SparklesIcon className="w-4 h-4 text-white" /> Intervue Poll
      </div>

      {/* Loader */}
      <div className="mb-6">
        <div
          className="w-14 h-14 rounded-full border-8 border-purple-800 border-r-transparent animate-spin mx-auto"
          style={{ borderRightColor: "transparent" }}
        ></div>
      </div>

      {/* Heading */}
     <h1 className="text-3xl font-bold text-gray-900 mb-3">
  Waiting for Teacher to ask Questions...
</h1>


      {/* Subtitle */}
      
    </div>
  );
}

export default StudentWaitingPage;

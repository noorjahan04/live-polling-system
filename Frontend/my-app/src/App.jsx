import React, { useState } from "react";
import TeacherPanel from "./components/TeacherPanel";
import StudentPanel from "./components/StudentPanel";
import { SparklesIcon } from "@heroicons/react/24/solid";

export default function App() {
  const [role, setRole] = useState("");
  const [confirmedRole, setConfirmedRole] = useState("");

  if (confirmedRole) {
    return confirmedRole === "teacher" ? <TeacherPanel /> : <StudentPanel />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
      <div className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white px-4 py-1 rounded-full mb-6 text-sm font-medium shadow flex items-center gap-1">
  <SparklesIcon className="w-4 h-4 text-white" />
  Intervue Poll
</div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl mb-4 font-normal leading-tight">
        Welcome to the <span className="font-bold text-black">Live Polling</span>
        <br />
        <span className="font-bold text-black">System</span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-500 mb-8 max-w-md text-base md:text-lg">
        Please select the role that best describes you to begin using the live
        polling system
      </p>

      {/* Role options */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div
          onClick={() => setRole("student")}
          className={`cursor-pointer border rounded-lg p-6 w-64 text-left transition ${
            role === "student"
              ? "border-[#4D0ACD] shadow-lg"
              : "hover:border-[#7565D9]"
          }`}
        >
          <h2 className="font-bold text-lg mb-1">I’m a Student</h2>
          <p className="text-gray-600 text-sm">
            Participate in live polls and see how your responses compare
          </p>
        </div>

        <div
          onClick={() => setRole("teacher")}
          className={`cursor-pointer border rounded-lg p-6 w-64 text-left transition ${
            role === "teacher"
              ? "border-[#4D0ACD] shadow-lg"
              : "hover:border-[#7565D9]"
          }`}
        >
          <h2 className="font-bold text-lg mb-1">I’m a Teacher</h2>
          <p className="text-gray-600 text-sm">
            Submit answers and view live poll results in real-time.
          </p>
        </div>
      </div>

      {/* Continue button */}
      <button
        disabled={!role}
        onClick={() => setConfirmedRole(role)}
        className={`px-10 py-3 rounded-full shadow transition 
          ${
            role
              ? "bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white hover:opacity-90"
              : "bg-gray-300 text-white cursor-not-allowed"
          }`}
      >
        Continue
      </button>
    </div>
  );
}

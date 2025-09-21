import React, { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/solid";

function StudentNamePage({ onNameSubmit }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Top Badge */}
      <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white text-sm font-medium shadow mb-8">
        <SparklesIcon className="w-4 h-4 text-white" />
        Intervue Poll
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 text-center">
        Let’s <span className="font-bold">Get Started</span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-500 max-w-xl text-center mb-8 text-base md:text-lg">
        If you're a student, you'll be able to{" "}
        <span className="font-semibold text-gray-700">submit your answers</span>
        , participate in live polls, and see how your responses compare with
        your classmates.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-md"
      >
        <label
          htmlFor="name"
          className="text-base font-medium text-gray-900 mb-2 self-start"
        >
          Enter your Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-100 border-0 rounded-lg px-4 py-3 text-base text-gray-700 placeholder-gray-400 mb-6 focus:outline-none focus:ring-2 focus:ring-[#7565D9]"
          placeholder="Enter your name"
          autoFocus
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className={`px-10 py-3 rounded-full shadow transition text-white font-medium text-base 
            ${
              name.trim()
                ? "bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default StudentNamePage;

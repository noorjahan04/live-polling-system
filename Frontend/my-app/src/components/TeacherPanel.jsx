import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ChatBox from "./ChatBox";
import PollResults from "./PollResults";
import { FaPlus, FaEye, FaCommentDots } from "react-icons/fa";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3001");

export default function TeacherPanel() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [timer, setTimer] = useState(60);
  const [results, setResults] = useState({});
  const [showChat, setShowChat] = useState(false);

  const handleSendQuestion = () => {
    const optionTexts = options.map((opt) => opt.text);

    // Emit poll creation
    socket.emit("teacher:create-poll", {
      question,
      options: optionTexts,
      timeLimit: timer,
    });

    // Auto-start the poll after creating
    socket.emit("teacher:start-poll");

    setQuestion("");
    setOptions([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
  };

  useEffect(() => {
    // Listen for real-time poll updates
    socket.on("poll:results-updated", (res) => {
      setResults(res);
    });

    socket.on("poll:ended", (res) => {
      setResults(res);
    });

    return () => {
      socket.off("poll:results-updated");
      socket.off("poll:ended");
    };
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaPlus /> Intervue Poll
        </button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaEye /> View Poll History
        </button>
      </div>

      {/* Title & Description */}
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Let's Get Started</h2>
      <p className="mb-6 text-gray-600">
        You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
      </p>

      {/* Question Input with Timer */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="font-semibold">Enter your question</label>
          <div className="relative w-40">
            <select
              value={timer}
              onChange={(e) => setTimer(Number(e.target.value))}
              className="appearance-none bg-gray-100 border px-3 py-2 rounded w-full pr-10 text-sm"
            >
              {[30, 45, 60, 90, 120].map((t) => (
                <option key={t} value={t}>
                  {t} seconds
                </option>
              ))}
            </select>

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="14" height="10" viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
                <polygon points="0,0 10,0 5,6" fill="#6b21a8" />
              </svg>
            </div>
          </div>
        </div>

        <textarea
          placeholder="Enter your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="bg-gray-100 border px-3 py-3 rounded w-full h-20 resize-none"
          maxLength={200}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {question.length}/200
        </div>
      </div>

      {/* Edit Options Section */}
      <div className="flex justify-between items-center mb-2">
        <label className="font-semibold">Edit Options</label>
        <label className="font-semibold">Is it Correct?</label>
      </div>

      {/* Options Inputs */}
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-4 mb-2">
          <input
            type="text"
            placeholder={`Option ${i + 1}`}
            value={opt.text}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[i].text = e.target.value;
              setOptions(newOptions);
            }}
            className="bg-gray-100 border px-3 py-2 rounded flex-grow"
          />
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={opt.isCorrect}
                onChange={() => {
                  const newOptions = options.map((o, index) => ({
                    ...o,
                    isCorrect: index === i,
                  }));
                  setOptions(newOptions);
                }}
              />
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={!opt.isCorrect}
                onChange={() => {
                  const newOptions = [...options];
                  newOptions[i].isCorrect = false;
                  setOptions(newOptions);
                }}
              />
              No
            </label>
          </div>
        </div>
      ))}

      {/* Add Option Button */}
      <button
        onClick={() => setOptions([...options, { text: "", isCorrect: false }])}
        className="bg-white border border-purple-600 text-purple-600 px-4 py-2 rounded mb-6 flex items-center gap-2"
      >
        <FaPlus /> Add More Option
      </button>

      {/* Submit Button aligned right */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSendQuestion}
          className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
        >
          Ask Question
        </button>
      </div>

      {/* Results & Chat */}
      <PollResults results={results} />
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-purple-600 text-white p-3 rounded-full shadow-lg"
        >
          <FaCommentDots />
        </button>
        {showChat && <ChatBox socket={socket} />}
      </div>
    </div>
  );
}

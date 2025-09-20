import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ChatBox from "./ChatBox";
import PollResults from "./PollResults";
import { SparklesIcon } from "@heroicons/react/24/solid";

const socket = io(import.meta.env.VITE_BACKEND_URL || "https://live-polling-system-1-etsy.onrender.com");

export default function StudentPanel() {
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [results, setResults] = useState({});
  const [voted, setVoted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(60); // countdown in seconds
  const [disabled, setDisabled] = useState(false); // disable buttons after time is up

  useEffect(() => {
    const savedName = sessionStorage.getItem("studentName");
    const savedId = sessionStorage.getItem("sessionId");

    if (savedName && savedId) {
      setName(savedName);
      setSessionId(savedId);
      socket.emit("student:join", { name: savedName, sessionId: savedId });
      setSubmitted(true);
    }
  }, []);

  useEffect(() => {
    // Receive current poll from backend
    socket.on("poll:started", (poll) => {
      setQuestion(poll);
      setResults({});
      setVoted(false);
      setDisabled(false);
      setTimer(60); // reset timer
    });

    // Receive live poll results
    socket.on("poll:results-updated", (res) => {
      setResults(res);
    });

    socket.on("poll:ended", (res) => {
      setResults(res);
      setQuestion(null);
      setVoted(false);
      setDisabled(false);
    });

    // If teacher kicks student
    socket.on("student:kicked", () => {
      alert("You have been removed by the teacher.");
      setQuestion(null);
      setResults({});
      setVoted(false);
      setSubmitted(false);
      setName("");
      sessionStorage.clear();
    });

    return () => {
      socket.off("poll:started");
      socket.off("poll:results-updated");
      socket.off("poll:ended");
      socket.off("student:kicked");
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (question && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setDisabled(true); // disable options when timer ends
    }
  }, [question, timer]);

  const handleVote = (optionId) => {
    if (!voted && sessionId && question && !disabled) {
      socket.emit("student:submit-answer", { sessionId, optionId });
      setVoted(true);
    }
  };

  const handleSetName = () => {
    if (name.trim()) {
      const newId = Math.random().toString(36).substr(2, 9);
      setSessionId(newId);
      sessionStorage.setItem("studentName", name);
      sessionStorage.setItem("sessionId", newId);
      socket.emit("student:join", { name, sessionId: newId });
      setSubmitted(true);
    } else {
      alert("Please enter your name.");
    }
  };

  const isNameEntered = name.trim().length > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative">
      {!submitted ? (
        <div className="max-w-md w-full text-center">
          <div className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white px-4 py-1 rounded-full mb-6 text-sm font-medium shadow inline-flex items-center gap-1">
            <SparklesIcon className="w-4 h-4 text-white" /> Intervue Poll
          </div>

          <h1 className="text-3xl mb-2">
            Let’s <span className="font-bold">Get Started</span>
          </h1>

          <p className="text-gray-600 mb-6 text-sm">
            If you're a student, you'll be able to <b>submit your answers</b>, participate in live polls, and see how your responses compare with your classmates.
          </p>

          <label className="block text-left text-gray-700 mb-2">Enter your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-3 mb-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your name"
          />

          <button
            onClick={handleSetName}
            disabled={!isNameEntered}
            className={`px-6 py-2 rounded-full font-semibold shadow transition ${
              isNameEntered
                ? "bg-purple-700 text-white hover:bg-purple-800"
                : "bg-purple-300 text-white cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      ) : !question ? (
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <div className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white px-4 py-1 rounded-full mb-6 text-sm font-medium shadow inline-flex items-center gap-1">
            <SparklesIcon className="w-4 h-4 text-white" /> Intervue Poll
          </div>

          <div className="mb-6">
            <div
              className="w-12 h-12 rounded-full border-4 border-purple-600 border-r-transparent animate-spin"
              style={{ borderRightColor: "transparent" }}
            ></div>
          </div>

          <p className="text-lg font-bold text-gray-750">
            Wait for the teacher to ask questions...
          </p>
        </div>
      ) : (
        <div className="w-full max-w-lg">
          <h2 className="text-xl mb-4 font-semibold">Welcome {name} 👋</h2>
          <div className="mb-4 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">{question.question}</h3>
              <span className={`text-sm font-medium ${timer <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                {timer}s remaining
              </span>
            </div>
            <div className="space-y-3">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={voted || disabled}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    voted || disabled 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
          <PollResults results={results} />
        </div>
      )}

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white text-2xl p-4 rounded-full shadow-lg hover:bg-indigo-700 transition"
      >
        💬
      </button>

      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white shadow-xl rounded-lg border flex flex-col">
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-t-lg font-semibold">
            Chat Support
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatBox socket={socket} />
          </div>
        </div>
      )}
    </div>
  );
}
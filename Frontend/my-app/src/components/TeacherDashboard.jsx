import React, { useState, useEffect } from "react";
import { Plus, ChevronDown, Eye, MessageCircle, X } from "lucide-react";
import { SparklesIcon } from "@heroicons/react/24/solid";

function TeacherDashboard({ socket }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [timeLimit, setTimeLimit] = useState("60");
  const [students, setStudents] = useState([]);
  const [pollResults, setPollResults] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showPollHistory, setShowPollHistory] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [activeTab, setActiveTab] = useState("participants");

  useEffect(() => {
    socket.on("teacher:joined", (data) => {
      setStudents(data.students || []);
      setPollHistory(data.pollHistory || []);
    });
    socket.on("student:connected", (data) => setStudents(data.students));
    socket.on("student:disconnected", (data) => setStudents(data.students));
    socket.on("student:removed", (data) => setStudents(data.students));
    socket.on("poll:created", (poll) => setCurrentPoll(poll));
    socket.on("poll:started", (poll) => setCurrentPoll(poll));
    socket.on("poll:results-updated", (results) => setPollResults(results));
    socket.on("poll:ended", (results) => {
      setPollResults(results);
      setPollHistory((prev) => [...prev, results]);
      setCurrentPoll(null);
    });
    socket.on("chat:message", (data) =>
      setChatMessages((prev) => [...prev, data])
    );

    return () => {
      socket.off("teacher:joined");
      socket.off("student:connected");
      socket.off("student:disconnected");
      socket.off("student:removed");
      socket.off("poll:created");
      socket.off("poll:started");
      socket.off("poll:results-updated");
      socket.off("poll:ended");
      socket.off("chat:message");
    };
  }, [socket]);

  const addOption = () =>
    setOptions([...options, { text: "", isCorrect: false }]);

  const updateOption = (index, text) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const setCorrect = (index, isCorrect) => {
    const newOptions = [...options];
    newOptions[index].isCorrect = isCorrect;
    setOptions(newOptions);
  };

  const askQuestion = () => {
    if (question.trim() && options.every((opt) => opt.text.trim())) {
      const pollData = {
        question: question.trim(),
        options: options.map((opt) => opt.text.trim()),
        timeLimit,
      };
      socket.emit("teacher:create-poll", pollData);
      setTimeout(() => {
        socket.emit("teacher:start-poll");
      }, 100);
    }
  };

  const kickStudent = (sessionId) =>
    socket.emit("teacher:remove-student", { sessionId });

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      socket.emit("chat:message", {
        message: chatInput.trim(),
        sender: "Teacher",
        senderType: "teacher",
      });
      setChatInput("");
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 lg:px-20">
      <div className="max-w-7xl mx-auto flex justify-between px-8 gap-12">
        {/* Left Section: Question & Options */}
        <div className="flex-1 max-w-2xl">
          <div className="pt-10">
            {/* Header */}
            <div className="flex justify-start items-center mb-6">
              <div className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white px-4 py-1 rounded-full text-sm font-medium shadow inline-flex items-center gap-1">
                <SparklesIcon className="w-4 h-4 text-white" /> Intervue Poll
              </div>
            </div>

            {/* Welcome */}
            <div className="mt-6">
              <h1 className="text-3xl text-gray-900 mb-2">
                Let’s <span className="font-bold">Get Started</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8">
                You’ll be able to create polls, ask questions, and monitor your
                students' responses in real-time.
              </p>
            </div>

            {/* Question Input */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-base font-semibold text-gray-900">
                  Enter your question
                </label>
                <div className="relative">
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="appearance-none bg-gray-200 px-4 py-2 pr-8 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none text-sm"
                  >
                    <option value="still">Still</option>
                    <option value="30">30 seconds</option>
                    <option value="60">60 seconds</option>
                    <option value="90">90 seconds</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                  />
                </div>
              </div>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-4 bg-gray-200 border-0 rounded-xl resize-none h-24 focus:ring-2 focus:ring-purple-400 focus:outline-none text-lg"
                placeholder="Enter your question here..."
                maxLength={200}
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {question.length} / 200
              </div>

              {/* Options */}
              <div className="mt-6">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 bg-gray-200 p-3 rounded-lg mb-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 p-3 bg-gray-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none text-base"
                      placeholder={`Option ${index + 1}`}
                    />
                    <div className="flex space-x-4 text-sm">
                      <label className="flex items-center space-x-1">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={option.isCorrect}
                          onChange={() => setCorrect(index, true)}
                          className="accent-purple-500"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-1">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={!option.isCorrect}
                          onChange={() => setCorrect(index, false)}
                          className="accent-purple-500"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="flex items-center space-x-2 px-6 py-2 bg-white text-purple-600 border border-purple-300 rounded-full shadow hover:bg-purple-50 transition-all"
                >
                  <Plus size={18} />
                  <span>Add Option</span>
                </button>
              </div>

              {/* Ask Question Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={askQuestion}
                  className="px-12 py-4 bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white font-semibold rounded-full shadow-lg hover:opacity-90 transition-all text-lg"
                >
                  Ask Question
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Poll History & Chat */}
        <div className="w-96 flex flex-col items-end pt-10 pr-6 space-y-6">
          <button
            onClick={() => setShowPollHistory(true)}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white font-semibold rounded-full shadow-md hover:opacity-90 transition"
          >
            <Eye size={18} />
            <span>View Poll History</span>
          </button>

          {/* Floating Chat Button */}
          <div className="flex-1"></div>
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-16 h-16 mb-6 bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white rounded-full shadow-lg hover:opacity-90 transition-colors flex items-center justify-center"
          >
            {showChat ? <X size={24} /> : <MessageCircle size={24} />}
          </button>
        </div>

        {/* Sidebar + Chat */}
        {showChat && (
          <div className="fixed right-8 bottom-32 w-[420px] flex flex-col items-end z-50">
            <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex space-x-4 border-b px-6 py-4">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-2 font-semibold transition-all rounded-lg ${
                    activeTab === "chat"
                      ? "text-purple-600 bg-purple-50 border-b-2 border-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab("participants")}
                  className={`px-4 py-2 font-semibold transition-all rounded-lg ${
                    activeTab === "participants"
                      ? "text-purple-600 bg-purple-50 border-b-2 border-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  Participants
                </button>
              </div>

              <div className="h-[420px] overflow-hidden">
                {activeTab === "participants" ? (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-gray-700">Name</span>
                      <span className="font-semibold text-gray-700">Action</span>
                    </div>
                    {students.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        No students connected yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {students.map((student) => (
                          <div
                            key={student.id}
                            className="flex justify-between items-center py-2"
                          >
                            <span className="font-medium text-gray-700">
                              {student.name}
                            </span>
                            <button
                              onClick={() => kickStudent(student.id)}
                              className="text-blue-600 hover:text-blue-800 font-medium underline"
                            >
                              Kick Out
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-6 space-y-2">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-100 rounded-lg text-left"
                        >
                          <div className="font-semibold text-sm text-purple-600">
                            {msg.sender}
                          </div>
                          <div className="text-sm text-gray-700">{msg.message}</div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={sendChatMessage} className="p-4 border-t">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 p-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                          placeholder="Type message..."
                        />
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white rounded-lg hover:opacity-90 transition"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Poll History Modal */}
        {showPollHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Poll History</h2>
                <button
                  onClick={() => setShowPollHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {pollHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No polls conducted yet.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {pollHistory.map((poll, index) => (
                      <div
                        key={poll.id || index}
                        className="border rounded-xl p-6 bg-gray-50"
                      >
                        <h3 className="text-xl font-bold mb-4">{poll.question}</h3>
                        <div className="space-y-3">
                          {poll.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {optIndex + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{option.text}</span>
                                  <span className="font-bold">{option.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${option.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                          Total votes: {poll.totalVotes}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function StudentQuestionPage({ socket, poll, studentData }) {
  const [timeLeft, setTimeLeft] = useState(poll?.timeLeft || 60);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (poll && poll.timeLeft) {
      setTimeLeft(poll.timeLeft);
    }
  }, [poll]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (selectedOption !== null && !submitted) {
      socket.emit('student:submit-answer', {
        sessionId: studentData.sessionId,
        optionId: selectedOption
      });
      setSubmitted(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!poll) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl">
        {/* Header: Dark background */}
        <div className="bg-gray-900 text-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Question 1</h1>
            <div className="flex items-center space-x-2">
              <Clock size={18} />
              <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-400' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <p className="text-md mt-1 text-gray-300">{poll.question}</p>
        </div>

        {/* Options area: lighter background */}
        <div className="p-4 bg-gray-50">
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => !submitted && setSelectedOption(option.id)}
                disabled={submitted}
                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                  selectedOption === option.id
                    ? 'border-purple-500 bg-purple-100'
                    : submitted
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    : 'border-gray-200 hover:border-purple-500'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold ${
                    selectedOption === option.id ? 'bg-purple-500' : 'bg-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-md font-medium text-left">{option.text}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || submitted}
              className={`px-10 py-3 rounded-full text-white font-semibold text-md transition-all duration-200 ${
                selectedOption !== null && !submitted
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105'
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
            >
              {submitted ? 'Submitted!' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentQuestionPage;

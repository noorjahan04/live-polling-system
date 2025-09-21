import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import LandingPage from './components/LandingPage';
import StudentNamePage from './components/StudentNamePage';
import StudentWaitingPage from './components/StudentWaitingPage';
import StudentQuestionPage from './components/StudentQuestionPage';
import TeacherDashboard from './components/TeacherDashboard';
import KickedOutPage from './components/KickedOutPage';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [userType, setUserType] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [isKicked, setIsKicked] = useState(false);

  useEffect(() => {
    const newSocket = io('https://live-polling-backend-6rmx.onrender.com');
    setSocket(newSocket);

    newSocket.on('student:kicked', () => {
      setIsKicked(true);
      setCurrentPage('kicked');
    });

    newSocket.on('poll:started', (poll) => {
      setCurrentPoll(poll);
      if (userType === 'student') {
        setCurrentPage('question');
      }
    });

    newSocket.on('poll:ended', () => {
      setCurrentPoll(null);
      if (userType === 'student') {
        setCurrentPage('waiting');
      }
    });

    return () => newSocket.close();
  }, [userType]);

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    if (type === 'student') {
      setCurrentPage('studentName');
    } else {
      setCurrentPage('teacher');
      socket.emit('teacher:join');
    }
  };

  const handleStudentNameSubmit = (name) => {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const data = { name, sessionId };
    console.log('Student joining with data:', data);
    setStudentData(data);
    socket.emit('student:join', data);
    setCurrentPage('waiting');
  };

  if (isKicked) {
    return <KickedOutPage />;
  }

  switch (currentPage) {
    case 'landing':
      return <LandingPage onUserTypeSelect={handleUserTypeSelection} />;
    case 'studentName':
      return <StudentNamePage onNameSubmit={handleStudentNameSubmit} />;
    case 'waiting':
      return <StudentWaitingPage />;
    case 'question':
      return <StudentQuestionPage socket={socket} poll={currentPoll} studentData={studentData} />;
    case 'teacher':
      return <TeacherDashboard socket={socket} />;
    default:
      return <LandingPage onUserTypeSelect={handleUserTypeSelection} />;
  }
}

export default App;
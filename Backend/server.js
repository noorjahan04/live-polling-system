import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage
let currentPoll = null;
let pollHistory = [];
let connectedStudents = new Map();
let teacherSocket = null;

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Teacher joins
  socket.on('teacher:join', () => {
    teacherSocket = socket;
    socket.join('teacher');
    socket.emit('teacher:joined', {
      currentPoll,
      students: Array.from(connectedStudents.values()),
      pollHistory
    });
  });

  // Student joins
  socket.on('student:join', (data) => {
    const { name, sessionId } = data;
    const student = {
      id: sessionId,
      name,
      socketId: socket.id,
      connected: true,
      answered: currentPoll ? false : null
    };
    
    connectedStudents.set(sessionId, student);
    socket.join('students');
    
    socket.emit('student:joined', {
      sessionId,
      currentPoll: currentPoll ? {
        ...currentPoll,
        timeLeft: currentPoll.startTime ? Math.max(0, currentPoll.timeLimit - Math.floor((Date.now() - currentPoll.startTime) / 1000)) : currentPoll.timeLimit
      } : null
    });

    // Notify teacher
    if (teacherSocket) {
      teacherSocket.emit('student:connected', {
        students: Array.from(connectedStudents.values())
      });
    }
  });

  // Teacher creates poll
  socket.on('teacher:create-poll', (data) => {
    if (currentPoll && currentPoll.status === 'active') {
      socket.emit('error', { message: 'Poll is currently active' });
      return;
    }

    const poll = {
      id: generateId(),
      question: data.question,
      options: data.options.map((option, index) => ({
        id: index,
        text: option,
        votes: []
      })),
      timeLimit: data.timeLimit || 60,
      status: 'created',
      createdAt: Date.now(),
      startTime: null
    };

    currentPoll = poll;
    socket.emit('poll:created', poll);
  });

  // Teacher starts poll
  socket.on('teacher:start-poll', () => {
    if (!currentPoll || currentPoll.status === 'active') return;

    currentPoll.status = 'active';
    currentPoll.startTime = Date.now();

    // Reset student answered status
    connectedStudents.forEach(student => {
      student.answered = false;
    });

    // Broadcast to all students
    io.to('students').emit('poll:started', {
      ...currentPoll,
      timeLeft: currentPoll.timeLimit
    });

    // Notify teacher
    socket.emit('poll:started', currentPoll);

    // Start timer
    setTimeout(() => {
      if (currentPoll && currentPoll.status === 'active') {
        endCurrentPoll();
      }
    }, currentPoll.timeLimit * 1000);
  });

  // Student submits answer
  socket.on('student:submit-answer', (data) => {
    const { sessionId, optionId } = data;
    
    if (!currentPoll || currentPoll.status !== 'active') return;

    const student = connectedStudents.get(sessionId);
    if (!student || student.answered) return;

    // Record vote
    const option = currentPoll.options.find(opt => opt.id === optionId);
    if (option) {
      option.votes.push(sessionId);
      student.answered = true;

      // Check if all students answered
      const allAnswered = Array.from(connectedStudents.values())
        .filter(s => s.connected)
        .every(s => s.answered);

      // Broadcast updated results
      const results = calculateResults();
      io.emit('poll:results-updated', results);

      if (allAnswered) {
        endCurrentPoll();
      }
    }
  });

  // Chat message
  socket.on('chat:message', (data) => {
    const { message, sender, senderType } = data;
    io.emit('chat:message', {
      message,
      sender,
      senderType,
      timestamp: Date.now()
    });
  });

  // Teacher removes student
  socket.on('teacher:remove-student', (data) => {
    const { sessionId } = data;
    const student = connectedStudents.get(sessionId);
    
    if (student) {
      // Find and disconnect student socket
      const studentSocket = io.sockets.sockets.get(student.socketId);
      if (studentSocket) {
        studentSocket.emit('student:kicked');
        studentSocket.disconnect();
      }
      
      connectedStudents.delete(sessionId);
      
      // Notify teacher
      socket.emit('student:removed', {
        students: Array.from(connectedStudents.values())
      });
    }
  });

  // Teacher ends poll manually
  socket.on('teacher:end-poll', () => {
    if (currentPoll && currentPoll.status === 'active') {
      endCurrentPoll();
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove student if disconnected
    for (const [sessionId, student] of connectedStudents.entries()) {
      if (student.socketId === socket.id) {
        connectedStudents.delete(sessionId);
        
        // Notify teacher
        if (teacherSocket) {
          teacherSocket.emit('student:disconnected', {
            students: Array.from(connectedStudents.values())
          });
        }
        break;
      }
    }

    // Clear teacher socket
    if (teacherSocket?.id === socket.id) {
      teacherSocket = null;
    }
  });
});

function endCurrentPoll() {
  if (!currentPoll) return;

  currentPoll.status = 'ended';
  currentPoll.endTime = Date.now();

  // Add to history
  pollHistory.push({ ...currentPoll });

  const results = calculateResults();
  io.emit('poll:ended', results);

  currentPoll = null;
}

function calculateResults() {
  if (!currentPoll) return null;

  const totalVotes = currentPoll.options.reduce((sum, option) => sum + option.votes.length, 0);
  
  return {
    id: currentPoll.id,
    question: currentPoll.question,
    options: currentPoll.options.map(option => ({
      id: option.id,
      text: option.text,
      votes: option.votes.length,
      percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
    })),
    totalVotes,
    status: currentPoll.status
  };
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

// === CORS Setup ===
const FRONTEND_URL = "https://live-polling-system-roan.vercel.app"; // No trailing slash

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Express CORS
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST"]
}));
app.use(express.json());

// In-memory storage
let currentPoll = null;
let pollHistory = [];
let connectedStudents = new Map();
let teacherSocket = null;

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// === Socket.IO Connection ===
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // === Teacher joins ===
  socket.on('teacher:join', () => {
    teacherSocket = socket;
    socket.join('teacher');
    console.log('Teacher joined:', socket.id);
    socket.emit('teacher:joined', {
      currentPoll,
      students: Array.from(connectedStudents.values()),
      pollHistory
    });
  });

  // === Student joins ===
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

    console.log(`Student joined: ${name} (${sessionId})`);

    socket.emit('student:joined', {
      sessionId,
      currentPoll: currentPoll ? {
        ...currentPoll,
        timeLeft: currentPoll.startTime
          ? Math.max(0, currentPoll.timeLimit - Math.floor((Date.now() - currentPoll.startTime) / 1000))
          : currentPoll.timeLimit
      } : null
    });

    // Notify teacher
    if (teacherSocket) {
      teacherSocket.emit('student:connected', {
        students: Array.from(connectedStudents.values())
      });
    }
  });

  // === Teacher creates poll ===
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
    console.log('Poll created:', poll);
    socket.emit('poll:created', poll);
  });

  // === Teacher starts poll ===
  socket.on('teacher:start-poll', () => {
    if (!currentPoll || currentPoll.status === 'active') return;

    currentPoll.status = 'active';
    currentPoll.startTime = Date.now();

    connectedStudents.forEach(student => {
      student.answered = false;
    });

    io.to('students').emit('poll:started', {
      ...currentPoll,
      timeLeft: currentPoll.timeLimit
    });

    socket.emit('poll:started', currentPoll);

    console.log('Poll started:', currentPoll.id);

    setTimeout(() => {
      if (currentPoll && currentPoll.status === 'active') {
        endCurrentPoll();
      }
    }, currentPoll.timeLimit * 1000);
  });

  // === Student submits answer ===
  socket.on('student:submit-answer', ({ sessionId, optionId }) => {
    if (!currentPoll || currentPoll.status !== 'active') return;

    const student = connectedStudents.get(sessionId);
    if (!student || student.answered) return;

    const option = currentPoll.options.find(opt => opt.id === optionId);
    if (option) {
      option.votes.push(sessionId);
      student.answered = true;

      console.log(`Student ${student.name} answered option ${optionId}`);

      const allAnswered = Array.from(connectedStudents.values())
        .filter(s => s.connected)
        .every(s => s.answered);

      io.emit('poll:results-updated', calculateResults());

      if (allAnswered) endCurrentPoll();
    }
  });

  // === Chat messages ===
  socket.on('chat:message', (data) => {
    io.emit('chat:message', { ...data, timestamp: Date.now() });
  });

  // === Teacher removes student ===
  socket.on('teacher:remove-student', ({ sessionId }) => {
    const student = connectedStudents.get(sessionId);
    if (student) {
      const studentSocket = io.sockets.sockets.get(student.socketId);
      if (studentSocket) {
        studentSocket.emit('student:kicked');
        studentSocket.disconnect();
      }
      connectedStudents.delete(sessionId);
      socket.emit('student:removed', {
        students: Array.from(connectedStudents.values())
      });
    }
  });

  // === Teacher ends poll manually ===
  socket.on('teacher:end-poll', () => {
    if (currentPoll && currentPoll.status === 'active') endCurrentPoll();
  });

  // === Disconnect ===
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    for (const [sessionId, student] of connectedStudents.entries()) {
      if (student.socketId === socket.id) {
        connectedStudents.delete(sessionId);
        if (teacherSocket) {
          teacherSocket.emit('student:disconnected', {
            students: Array.from(connectedStudents.values())
          });
        }
        break;
      }
    }

    if (teacherSocket?.id === socket.id) teacherSocket = null;
  });
});

// === Poll helper functions ===
function endCurrentPoll() {
  if (!currentPoll) return;

  currentPoll.status = 'ended';
  currentPoll.endTime = Date.now();
  pollHistory.push({ ...currentPoll });

  console.log('Poll ended:', currentPoll.id);

  io.emit('poll:ended', calculateResults());
  currentPoll = null;
}

function calculateResults() {
  if (!currentPoll) return null;

  const totalVotes = currentPoll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
  return {
    id: currentPoll.id,
    question: currentPoll.question,
    options: currentPoll.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes.length,
      percentage: totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0
    })),
    totalVotes,
    status: currentPoll.status
  };
}

// === Render port ===
const PORT = process.env.PORT || 3600;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

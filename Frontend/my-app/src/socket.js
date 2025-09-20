// src/socket.js
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://backend-1-2-jja6.onrender.com";

const socket = io(BACKEND_URL);

export default socket;

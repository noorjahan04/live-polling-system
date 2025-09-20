// src/socket.js
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://live-polling-system-1-etsy.onrender.com";

const socket = io(BACKEND_URL);

export default socket;

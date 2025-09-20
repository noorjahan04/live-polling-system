import React, { useState, useEffect } from "react";

export default function ChatBox({ socket }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [sender, setSender] = useState("Anonymous");

  useEffect(() => {
    socket.on("receive-chat-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive-chat-message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (msg.trim()) {
      socket.emit("send-chat-message", { sender, message: msg });
      setMsg("");
    }
  };

  return (
    <div className="mt-6 border p-3 rounded">
      <h3 className="font-bold mb-2">💬 Chat</h3>
      <div className="h-40 overflow-y-auto border p-2 mb-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender}:</b> {m.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Your name"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <input
        type="text"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="border px-2 py-1 mr-2 w-1/2"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Send
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function Messaging() {
  // 🔥 PUT YOUR HARDCODED CHATS HERE — inside the component, at the top
  const chats = [
    {
      id: 1,
      name: "Alice",
      messages: [
        { from: "Alice", text: "Hey there!" },
        { from: "You", text: "Hi Alice!" },
      ],
    },
    {
      id: 2,
      name: "Bob",
      messages: [
        { from: "Bob", text: "Hello!" },
        { from: "You", text: "Hey Bob!" },
      ],
    },
  ];

  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left panel chat list (ALWAYS visible on desktop) */}
      <div
        className={`w-full md:w-1/3 border-r border-gray-300 dark:border-gray-700 ${
          selectedChat ? "hidden md:block" : "block"
        }`}
      >
        <ChatList chats={chats} onSelectChat={setSelectedChat} />
      </div>

      {/* Right panel chat window */}
      <div
        className={`flex-1 ${
          selectedChat ? "block" : "hidden md:block"
        }`}
      >
        <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
      </div>
    </div>
  );
}

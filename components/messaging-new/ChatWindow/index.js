"use client";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function ChatWindow({ chat, onBack }) {  if (!chat) return null;
  
  return (
    <div className="flex flex-col flex-1 h-full transition-all duration-300 ease-in-out">
      {/* Back button */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="text-blue-600 dark:text-blue-400 font-semibold"
        >
          &larr; Back
        </button>
      </div>

      {/* Chat header, messages, input */}
      <ChatHeader user={chat.name} />
      <ChatMessages messages={chat.messages || []} />
      <ChatInput chatId={chat.id} />
    </div>
  );
}

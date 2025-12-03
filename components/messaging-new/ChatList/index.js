"use client";

export default function ChatList({ chats, onSelectChat }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className="text-left p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {chat.name}
        </button>
      ))}
    </div>
  );
}

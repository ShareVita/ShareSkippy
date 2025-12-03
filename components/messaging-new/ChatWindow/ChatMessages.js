export default function ChatMessages({ messages = [] }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-2 rounded-md max-w-xs ${
            msg.from === "You" ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 dark:bg-gray-700 text-black"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}

export default function MessageBubble({ text, from }) {
  const isMe = from === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`px-4 py-2 max-w-xs rounded-lg text-sm
        ${isMe 
          ? "bg-blue-600 text-white rounded-br-none" 
          : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
        }`}>
        {text}
      </div>
    </div>
  );
}

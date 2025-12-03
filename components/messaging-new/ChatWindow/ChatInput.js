export default function ChatInput() {
  return (
    <div className="h-16 px-4 flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 outline-none"
      />
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
        Send
      </button>
    </div>
  );
}

export default function ChatHeader() {
  return (
    <div className="h-16 px-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-400" />

      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">User Name</h2>
        <p className="text-xs text-green-500">Online</p>
      </div>
    </div>
  );
}

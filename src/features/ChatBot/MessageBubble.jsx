/* eslint-disable react/prop-types */
const MessageBubble = ({ message }) => (
  <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-xs lg:max-w-md rounded-2xl p-4 relative ${message.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none"}`}>

      {message.sender === "user" ? (
        <p className="whitespace-pre-wrap">{message.text}</p>
      ) : (
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.text }} />)}

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs opacity-70">{message.timestamp}</span>
      </div>
    </div>
  </div>
);

export default MessageBubble;
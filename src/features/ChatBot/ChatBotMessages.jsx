/* eslint-disable react/prop-types */
import { FaRobot, FaUser } from "react-icons/fa";
import ProductMessage from "./ProductMessage";

const ChatBotMessages = ({ messages, messagesEndRef, isCompact = false }) => {
    const renderMessageContent = (message) => {
        switch (message.type) {
            case "product":
                return <ProductMessage product={message.product} />;
            case "text":
            default:
                return (
                    <div
                        className="text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: message.text }}
                    />
                );
        }
    };

    return (
        <div className={`${isCompact ? 'h-96' : 'flex-1'} overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800`}>
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                        } items-start ${isCompact ? 'gap-2' : 'gap-3'}`}
                >
                    {message.sender === "bot" && (
                        <div className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center flex-shrink-0`}>
                            <FaRobot className={isCompact ? "w-3 h-3" : "w-5 h-5"} />
                        </div>
                    )}

                    <div
                        className={`${isCompact ? 'max-w-xs' : 'max-w-md'} ${message.sender === "user"
                                ? "bg-blue-600 dark:bg-blue-700 text-white rounded-b-lg rounded-tl-lg"
                                : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-b-lg rounded-tr-lg shadow-sm dark:shadow-gray-800"
                            }`}
                    >
                        {renderMessageContent(message)}
                        {message.timestamp && (
                            <p className={`text-xs opacity-70 ${isCompact ? 'mt-1 px-3 pb-2' : 'mt-2 px-4 pb-2'} dark:text-gray-300`}>
                                {message.timestamp.toLocaleTimeString()}
                            </p>
                        )}
                    </div>

                    {message.sender === "user" && (
                        <div className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} bg-gray-600 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0`}>
                            <FaUser className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                        </div>
                    )}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatBotMessages;
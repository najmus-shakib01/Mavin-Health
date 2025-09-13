/* eslint-disable react/prop-types */
import { FaHistory } from "react-icons/fa";

const HistoryTab = ({ medicalHistory, clearHistory }) => {
    return (
        <div className="min-h-[300px] dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 pl-5 dark:text-white">Medical Inquiry History</h3>
                {medicalHistory.length > 0 && (
                    <button onClick={clearHistory} className="text-xs text-red-600 pr-10 font-bold dark:text-red-400">
                        Clear All
                    </button>
                )}
            </div>

            {medicalHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <FaHistory className="h-12 w-12 mx-auto text-gray-300 mb-3 dark:text-gray-600" />
                    <p>No medical inquiries yet.</p>
                    <p className="text-sm mt-1">Your symptom analysis history will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] p-5 overflow-y-auto">
                    {medicalHistory.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(item.timestamp).toLocaleString()}
                                </span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                                    {item.language}
                                </span>
                            </div>
                            <p className="text-sm font-medium mb-2 dark:text-white">
                                Your Question: &quot;{item.query}&quot;
                            </p>
                            <div className="text-sm prose prose-sm max-w-none dark:text-gray-300" dangerouslySetInnerHTML={{ __html: item.response }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryTab;
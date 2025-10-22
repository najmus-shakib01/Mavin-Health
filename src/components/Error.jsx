/* eslint-disable react/prop-types */
import { XCircle } from "lucide-react";

const Error = ({ message, onRetry }) => (
  <div className="flex items-center justify-between p-4 mb-2 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
    <div className="flex items-center">
      <XCircle className="w-5 h-5 mr-2 text-red-600" />
      <span>{message}</span>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="ml-3 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
        Retry
      </button>
    )}
  </div>
);

export default Error;
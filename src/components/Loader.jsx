// eslint-disable-next-line react/prop-types
const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center py-6">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-200"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full bottom-4 border-emerald-600 border-t-transparent animate-spin"></div>
      </div>
      <span className="mt-3 text-sm font-medium text-gray-600 animate-pulse">{text}</span>
    </div>
  );
};

export default Loader;
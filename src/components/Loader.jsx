const Loader = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      <span className="ml-3 text-gray-600">Analyzing Symptoms...</span>
    </div>
  );
};

export default Loader;
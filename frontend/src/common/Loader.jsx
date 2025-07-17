const Loader = ({ text = "Loading..." }) => (
  <div className="flex justify-center items-center py-12 text-gray-600">
    <span className="animate-spin mr-2">🔄</span>
    {text}
  </div>
);

export default Loader;

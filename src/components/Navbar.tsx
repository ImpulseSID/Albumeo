const Navbar = () => {
  return (
    <nav className="bg-black/20 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3 group">
            <div className="p-5 rounded-lg transition-transform duration-500 group-hover:scale-125 group-hover:rotate-[15deg] group-hover:animate-bounce">
              <img src="/logo.svg" alt="Albumeo Logo" className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x group-hover:scale-110 transition-transform duration-500 group-hover:drop-shadow-glow">
              Albumeo
            </h1>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

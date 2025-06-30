import { Link, useLocation } from "react-router-dom";
import { Calendar, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  const {user, logout} = useAuth()

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "Add Event", path: "/add-events" },
    { name: "My Events", path: "/my-events" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <Link to="/" className="w-44 flex items-center">
            <img className="w-full h-full" src="/Gatherly.png" alt="Gatherly Logo" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition-colors duration-200"
                >
                  <img
                    src={user.photoURL || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLk_pj2Eee_Y8rJhgGrfusEV5owncPIKNEqg&s"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 btn-primary btn text-white px-4 py-2 rounded-full font-medium  transition-all duration-200"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-3">
          <div className="flex justify-center flex-wrap gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium ${
                  isActive(link.path)
                    ? "text-indigo-600"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};



export default Navbar;

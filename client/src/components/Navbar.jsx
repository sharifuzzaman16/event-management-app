import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-gray-100 p-4 flex justify-between items-center">
      <h1 className="font-bold text-xl">
        <Link to="/">EventManager</Link>
      </h1>

      <div className="space-x-4">
        {user ? (
          <>
            <img
              src={user.photoURL || 'https://via.placeholder.com/32'}
              alt="Profile"
              className="inline-block w-8 h-8 rounded-full"
            />
            <span>{user.name}</span>
            <button
              onClick={logout}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

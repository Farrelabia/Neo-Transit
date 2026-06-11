import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">NeoTransit</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-blue-200">Beranda</Link>
          {user ? (
            <>
              <Link to="/booking" className="hover:text-blue-200">Booking</Link>
              <Link to="/checkin" className="hover:text-blue-200">Check-in</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-200">Admin</Link>
              )}
              <span className="text-blue-200 text-sm">Halo, {user.name}</span>
              <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

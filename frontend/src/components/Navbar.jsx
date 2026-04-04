import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Stethoscope, LogOut, Menu, X, Bell, User, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-teal-600 font-bold text-xl">
          <Stethoscope size={24} />
          <span>DocBook BD</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/doctors" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">
            Find Doctors
          </Link>
          {user ? (
            <>
              {user.role === 'doctor' && (
                <Link to="/doctor/dashboard" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">
                  Dashboard
                </Link>
              )}
              {user.role === 'patient' && (
                <Link to="/my-appointments" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">
                  My Appointments
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium flex items-center gap-1">
                  <Shield size={14} /> Admin
                </Link>
              )}

              {/* Notifications */}
              <Link to="/notifications" className="relative text-gray-500 hover:text-teal-600 transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <Link to="/profile" className="text-gray-500 hover:text-teal-600 transition-colors">
                <User size={20} />
              </Link>

              <span className="text-sm text-gray-500">Hi, {user.name?.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-teal-600 transition-colors text-sm font-medium">
                Login
              </Link>
              <Link to="/register" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          <Link to="/doctors" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Find Doctors</Link>
          {user ? (
            <>
              {user.role === 'doctor' && (
                <Link to="/doctor/dashboard" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              )}
              {user.role === 'patient' && (
                <Link to="/my-appointments" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>My Appointments</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <Link to="/notifications" className="text-gray-600 text-sm font-medium flex items-center gap-1" onClick={() => setMenuOpen(false)}>
                Notifications {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </Link>
              <Link to="/profile" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="text-left text-red-500 text-sm font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="text-teal-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

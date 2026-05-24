import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaPaw, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isShelterStaff } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/pets', label: 'Find Pets' },
  ];

  if (isAuthenticated) {
    navLinks.push({ path: '/applications', label: 'My Applications' });
    
    if (isShelterStaff) {
      navLinks.push({ path: '/shelter-dashboard', label: 'Shelter Dashboard' });
    }
    
    if (isAdmin) {
      navLinks.push({ path: '/admin-dashboard', label: 'Admin Dashboard' });
    }
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaPaw className="text-2xl text-blue-600" />
            <span className="font-bold text-xl text-gray-800">PetAdoption</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-600" />
                  <span className="text-gray-700">{user?.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {user?.role === 'admin' ? 'Admin' : user?.role === 'shelter_staff' ? 'Staff' : 'Adopter'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-600 focus:outline-none"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-gray-600 hover:text-blue-600 transition"
              >
                {link.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <div className="py-2 text-gray-700">
                  <FaUser className="inline mr-2" />
                  {user?.name} ({user?.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 mt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
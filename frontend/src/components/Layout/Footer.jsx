import React from 'react';
import { FaPaw, FaHeart, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FaPaw className="text-2xl text-blue-400" />
              <span className="font-bold text-xl">PetAdoption</span>
            </div>
            <p className="text-gray-400">
              Giving loving homes to pets in need. Adopt, don't shop!
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/pets" className="text-gray-400 hover:text-white transition">Browse Pets</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="/faq" className="text-gray-400 hover:text-white transition">FAQ</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 PetAdoption. Made with <FaHeart className="inline text-red-500" /> for pets</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
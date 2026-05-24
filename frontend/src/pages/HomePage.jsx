import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPaw, FaHeart, FaHome, FaUsers } from 'react-icons/fa';
import { petAPI } from '../services/api';
import PetCard from '../components/Pets/PetCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const HomePage = () => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPets();
  }, []);

  const fetchFeaturedPets = async () => {
    try {
      const response = await petAPI.getAll({ limit: 6, status: 'available' });
      setFeaturedPets(response.data.pets);
    } catch (error) {
      console.error('Failed to fetch pets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Find Your Perfect Companion</h1>
            <p className="text-xl mb-8">Give a loving home to a pet in need. Adopt, don't shop!</p>
            <Link
              to="/pets"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
            >
              Browse Available Pets
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <FaPaw className="text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">200+</h3>
            <p className="text-gray-600">Happy Adoptions</p>
          </div>
          <div className="text-center">
            <FaHeart className="text-4xl text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">150+</h3>
            <p className="text-gray-600">Loving Homes</p>
          </div>
          <div className="text-center">
            <FaHome className="text-4xl text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">5</h3>
            <p className="text-gray-600">Shelters</p>
          </div>
          <div className="text-center">
            <FaUsers className="text-4xl text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">500+</h3>
            <p className="text-gray-600">Happy Adopters</p>
          </div>
        </div>
      </div>

      {/* Featured Pets */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Pets Looking for Home</h2>
          {featuredPets.length === 0 ? (
            <p className="text-center text-gray-600">No pets available for adoption at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/pets"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View All Pets
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Browse Pets</h3>
            <p className="text-gray-600">Explore our wonderful pets looking for a loving home</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Submit Application</h3>
            <p className="text-gray-600">Fill out adoption application with your details</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Meet & Adopt</h3>
            <p className="text-gray-600">Get approved and bring your new friend home</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
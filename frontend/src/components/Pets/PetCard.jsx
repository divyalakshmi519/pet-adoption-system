import React from 'react';
import { Link } from 'react-router-dom';
import { FaPaw, FaHeart } from 'react-icons/fa';

const PetCard = ({ pet }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'adopted':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={pet.image_url || 'https://via.placeholder.com/400x300?text=Pet+Image'}
          alt={pet.name}
          className="w-full h-64 object-cover"
        />
        <div className={`absolute top-4 right-4 ${getStatusColor(pet.adoption_status)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
          {pet.adoption_status.toUpperCase()}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
          <FaPaw className="text-blue-500" />
        </div>
        <p className="text-gray-600 mb-2">
          {pet.breed || 'Mixed Breed'} • {pet.age} {pet.age_unit || 'years'}
        </p>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {pet.description || 'No description available'}
        </p>
        <div className="flex justify-between items-center">
          <Link
            to={`/pets/${pet.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            View Details
          </Link>
          {pet.adoption_status === 'available' && (
            <Link
              to={`/apply/${pet.id}`}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 transition"
            >
              <FaHeart /> Adopt Me
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetCard;
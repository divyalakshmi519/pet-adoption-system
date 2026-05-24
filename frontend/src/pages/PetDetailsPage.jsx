import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdoptionForm from '../components/Adoptions/AdoptionForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { petAPI } from '../services/api';
import { FaPaw, FaCalendar, FaVenusMars, FaWeight, FaHeart, FaShieldAlt, FaSyringe } from 'react-icons/fa';

const PetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);

  useEffect(() => {
    fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await petAPI.getById(id);
      setPet(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load pet details');
      console.error('Failed to fetch pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'adopted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPetDetails} />;
  if (!pet) return <ErrorMessage message="Pet not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <img
              src={pet.image_url || 'https://via.placeholder.com/600x400?text=Pet+Image'}
              alt={pet.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Details Section */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{pet.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(pet.adoption_status)}`}>
                {pet.adoption_status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <FaPaw className="mr-2 text-blue-500" />
                <span>{pet.breed || 'Mixed Breed'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaCalendar className="mr-2 text-blue-500" />
                <span>{pet.age} {pet.age_unit || 'years'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaVenusMars className="mr-2 text-blue-500" />
                <span>Gender not specified</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaWeight className="mr-2 text-blue-500" />
                <span>Size not specified</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">About {pet.name}</h2>
              <p className="text-gray-600 leading-relaxed">
                {pet.description || 'No description available for this pet. Please contact the shelter for more information.'}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Health & Vaccination</h2>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FaSyringe className="mr-2 text-green-500" />
                  <span>Vaccination records available</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaShieldAlt className="mr-2 text-green-500" />
                  <span>Health checked by veterinarian</span>
                </div>
              </div>
            </div>

            {pet.medical_records && pet.medical_records.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Medical History</h2>
                <div className="space-y-2">
                  {pet.medical_records.map((record, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold">{record.record_type}</p>
                      <p className="text-sm text-gray-600">{record.description}</p>
                      <p className="text-xs text-gray-500">{record.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              {pet.adoption_status === 'available' && (
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setShowAdoptionForm(true);
                    } else {
                      navigate('/login');
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <FaHeart /> Apply for Adoption
                </button>
              )}
              <button
                onClick={() => navigate('/pets')}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Back to Listings
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAdoptionForm && (
        <AdoptionForm
          petId={pet.id}
          petName={pet.name}
          onClose={() => setShowAdoptionForm(false)}
        />
      )}
    </div>
  );
};

export default PetDetailsPage;
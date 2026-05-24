import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petAPI, adoptionAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const AdoptionApplicationPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    review_notes: '',
    agree_to_terms: false
  });

  const fetchPetDetails = useCallback(async () => {
    try {
      const response = await petAPI.getById(petId);
      setPet(response.data);
    } catch (error) {
      toast.error('Failed to load pet details');
      navigate('/pets');
    } finally {
      setLoading(false);
    }
  }, [petId, navigate]);

  useEffect(() => {
    fetchPetDetails();
  }, [fetchPetDetails]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agree_to_terms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setSubmitting(true);
    try {
      await adoptionAPI.apply({
        pet_id: parseInt(petId),
        review_notes: formData.review_notes
      });
      toast.success('Adoption application submitted successfully!');
      navigate('/applications');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!pet) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Adoption Application</h1>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold">Applying to adopt: {pet.name}</h2>
          <p className="text-gray-600 text-sm mt-1">
            {pet.breed} • {pet.age} {pet.age_unit} old
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to adopt this pet? *
            </label>
            <textarea
              name="review_notes"
              value={formData.review_notes}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please tell us about:
• Your home environment
• Your experience with pets
• Who will be the primary caregiver
• Why you're interested in this specific pet
• Any other relevant information"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Adoption Requirements</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Must be at least 18 years old</li>
              <li>✓ Provide a safe and loving home environment</li>
              <li>✓ Have necessary time and resources for pet care</li>
              <li>✓ Agree to home visit if required</li>
              <li>✓ Pay adoption fee (varies by pet)</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Shelter staff will review your application within 2-3 business days</li>
              <li>You may be contacted for a phone interview</li>
              <li>A meet-and-greet will be scheduled if approved</li>
              <li>Complete the adoption and take your new friend home!</li>
            </ol>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="agree_to_terms"
              name="agree_to_terms"
              checked={formData.agree_to_terms}
              onChange={handleChange}
              className="mt-1 mr-2"
              required
            />
            <label htmlFor="agree_to_terms" className="text-sm text-gray-700">
              I confirm that all information provided is accurate and true. I understand that
              submitting false information may result in application rejection. I agree to
              the adoption terms and conditions.
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/pets/${petId}`)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdoptionApplicationPage;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adoptionAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { FaCheckCircle, FaClock, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const ApplicationTrackingPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adoptionAPI.getUserApplications(user?.id);
      setApplications(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load applications');
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'pending':
        return <FaSpinner className="text-yellow-500 text-xl animate-spin" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500 text-xl" />;
      default:
        return <FaClock className="text-gray-500 text-xl" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchApplications} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Adoption Applications</h1>
        <p className="text-gray-600 mt-2">Track the status of your adoption requests</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">You haven't submitted any adoption applications yet.</p>
          <button
            onClick={() => window.location.href = '/pets'}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Pets
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-3 md:mb-0">
                    <img
                      src={application.image_url || 'https://via.placeholder.com/60x60?text=Pet'}
                      alt={application.pet_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-semibold">{application.pet_name}</h2>
                      <p className="text-gray-600 text-sm">
                        {application.pet_category} • Applied on {new Date(application.application_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
                      {application.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {application.review_notes && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Your Message:</h3>
                    <p className="text-gray-600 text-sm">{application.review_notes}</p>
                  </div>
                )}

                {application.reviewed_at && (
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Last reviewed: {new Date(application.reviewed_at).toLocaleDateString()}</p>
                    {application.reviewer_name && (
                      <p>Reviewed by: {application.reviewer_name}</p>
                    )}
                  </div>
                )}

                {application.status === 'approved' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Congratulations! 🎉</h3>
                    <p className="text-green-700 text-sm">
                      Your application has been approved! Please contact the shelter to schedule a meet-and-greet
                      and complete the adoption process.
                    </p>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2">Application Status</h3>
                    <p className="text-red-700 text-sm">
                      We regret to inform you that your application was not approved at this time.
                      Please feel free to apply for other pets that might be a better fit.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationTrackingPage;
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, adoptionAPI, petAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { 
  FaChartLine, FaUsers, FaPaw, FaHeart, FaClock, 
  FaCheckCircle, FaTimesCircle, FaCalendarAlt, 
  FaDog, FaCat, FaDove, FaFish, FaBug 
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminAnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    total_pets: 0,
    total_adopted: 0,
    total_available: 0,
    total_applications: 0,
    total_users: 0,
    adoption_by_type: [],
    monthly_trends: [],
    pending_applications: [],
    recent_adoptions: []
  });
  const [allApplications, setAllApplications] = useState([]);
  const [allPets, setAllPets] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardAPI.getAdminAnalytics();
      setAnalytics(response.data);
      
      const appsResponse = await adoptionAPI.getAll({ limit: 100 });
      setAllApplications(appsResponse.data.applications);
      
      const petsResponse = await petAPI.getAll({ limit: 100 });
      setAllPets(petsResponse.data.pets);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load analytics');
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Chart Data
  const adoptionTrendsData = {
    labels: analytics.monthly_trends.map(trend => trend.month),
    datasets: [
      {
        label: 'Adoptions',
        data: analytics.monthly_trends.map(trend => trend.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const adoptionByTypeData = {
    labels: analytics.adoption_by_type.map(item => item.category),
    datasets: [
      {
        data: analytics.adoption_by_type.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const statusDistributionData = {
    labels: ['Available', 'Pending', 'Adopted'],
    datasets: [
      {
        data: [analytics.total_available, analytics.total_pets - analytics.total_available - analytics.total_adopted, analytics.total_adopted],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(59, 130, 246, 0.8)'],
        borderWidth: 0
      }
    ]
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'dog': return <FaDog className="text-blue-500" />;
      case 'cat': return <FaCat className="text-orange-500" />;
      case 'bird': return <FaDove className="text-green-500" />;
      case 'fish': return <FaFish className="text-cyan-500" />;
      case 'rabbit': return <FaBug className="text-pink-500" />;
      default: return <FaPaw className="text-gray-500" />;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAnalytics} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's your adoption center overview.</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Pets</p>
              <p className="text-3xl font-bold">{analytics.total_pets}</p>
            </div>
            <FaPaw className="text-4xl text-blue-200" />
          </div>
          <div className="mt-2 text-blue-100 text-sm">
            {analytics.total_available} available for adoption
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Successful Adoptions</p>
              <p className="text-3xl font-bold">{analytics.total_adopted}</p>
            </div>
            <FaHeart className="text-4xl text-green-200" />
          </div>
          <div className="mt-2 text-green-100 text-sm">
            {((analytics.total_adopted / analytics.total_pets) * 100 || 0).toFixed(1)}% adoption rate
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Applications</p>
              <p className="text-3xl font-bold">{analytics.total_applications}</p>
            </div>
            <FaChartLine className="text-4xl text-purple-200" />
          </div>
          <div className="mt-2 text-purple-100 text-sm">
            {analytics.pending_applications?.length || 0} pending review
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Registered Users</p>
              <p className="text-3xl font-bold">{analytics.total_users}</p>
            </div>
            <FaUsers className="text-4xl text-pink-200" />
          </div>
          <div className="mt-2 text-pink-100 text-sm">
            Active adopters
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 font-medium text-sm transition ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-4 px-1 font-medium text-sm transition ${
              activeTab === 'applications'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Applications
          </button>
          <button
            onClick={() => setActiveTab('pets')}
            className={`pb-4 px-1 font-medium text-sm transition ${
              activeTab === 'pets'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pet Directory
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                Monthly Adoption Trends
              </h3>
              {analytics.monthly_trends && analytics.monthly_trends.length > 0 ? (
                <Line 
                  data={adoptionTrendsData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: false }
                    }
                  }}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaHeart className="text-red-500" />
                Adoptions by Pet Type
              </h3>
              {analytics.adoption_by_type && analytics.adoption_by_type.length > 0 ? (
                <div className="flex justify-center">
                  <div style={{ width: '250px', height: '250px' }}>
                    <Doughnut 
                      data={adoptionByTypeData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Pet Status Distribution</h3>
              <div className="flex justify-center">
                <div style={{ width: '250px', height: '250px' }}>
                  <Doughnut 
                    data={statusDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Average Applications per Pet</span>
                  <span className="font-bold text-lg">
                    {(analytics.total_applications / analytics.total_pets || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Success Rate</span>
                  <span className="font-bold text-lg text-green-600">
                    {((analytics.total_adopted / analytics.total_applications) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Available Pets Ratio</span>
                  <span className="font-bold text-lg text-blue-600">
                    {((analytics.total_available / analytics.total_pets) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaClock className="text-yellow-500" />
                Pending Applications
              </h3>
              {analytics.pending_applications?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending applications</p>
              ) : (
                <div className="space-y-3">
                  {analytics.pending_applications?.slice(0, 5).map(app => (
                    <div key={app.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{app.applicant_name}</p>
                        <p className="text-sm text-gray-600">for {app.pet_name}</p>
                      </div>
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Recent Adoptions
              </h3>
              {analytics.recent_adoptions?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent adoptions</p>
              ) : (
                <div className="space-y-3">
                  {analytics.recent_adoptions?.map(adoption => (
                    <div key={adoption.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{adoption.adopter_name}</p>
                        <p className="text-sm text-gray-600">adopted {adoption.pet_name}</p>
                      </div>
                      <span className="text-xs text-green-600">
                        {new Date(adoption.reviewed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">All Adoption Applications</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Applicant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Pet</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {allApplications.map(app => (
                  <tr key={app.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">#{app.id}</td>
                    <td className="px-4 py-3">{app.applicant_name}</td>
                    <td className="px-4 py-3">{app.pet_name}</td>
                    <td className="px-4 py-3">{new Date(app.application_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <span className={`capitalize ${
                          app.status === 'approved' ? 'text-green-600' :
                          app.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pets' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Pet Directory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPets.map(pet => (
              <div key={pet.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  {getCategoryIcon(pet.category_name)}
                  <div>
                    <h4 className="font-semibold">{pet.name}</h4>
                    <p className="text-sm text-gray-600">{pet.breed || 'Mixed Breed'}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{pet.category_name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    pet.adoption_status === 'available' ? 'bg-green-100 text-green-800' :
                    pet.adoption_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pet.adoption_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
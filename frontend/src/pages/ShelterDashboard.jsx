import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { petAPI, adoptionAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaCheck, FaTimes, FaEye, FaPaw, FaHeart, FaClock } from 'react-icons/fa';

const ShelterDashboard = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [stats, setStats] = useState({
    totalPets: 0,
    availablePets: 0,
    adoptedPets: 0,
    pendingApplications: 0,
    totalApplications: 0
  });

  const [newPet, setNewPet] = useState({
    name: '',
    category_id: '1',
    breed: '',
    age: '',
    age_unit: 'years',
    description: '',
    image_url: '',
    shelter_id: 1
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const petsResponse = await petAPI.getAll({ limit: 100 });
      setPets(petsResponse.data.pets || []);
      
      const appsResponse = await adoptionAPI.getAll({ limit: 100 });
      setApplications(appsResponse.data.applications || []);
      
      const availablePets = (petsResponse.data.pets || []).filter(p => p.adoption_status === 'available').length;
      const adoptedPets = (petsResponse.data.pets || []).filter(p => p.adoption_status === 'adopted').length;
      const pendingApps = (appsResponse.data.applications || []).filter(a => a.status === 'pending').length;
      
      setStats({
        totalPets: petsResponse.data.pets?.length || 0,
        availablePets: availablePets,
        adoptedPets: adoptedPets,
        pendingApplications: pendingApps,
        totalApplications: appsResponse.data.applications?.length || 0
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      await petAPI.create(newPet);
      toast.success('Pet added successfully!');
      setShowAddPetForm(false);
      setNewPet({
        name: '',
        category_id: '1',
        breed: '',
        age: '',
        age_unit: 'years',
        description: '',
        image_url: '',
        shelter_id: 1
      });
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add pet');
    }
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();
    try {
      await petAPI.update(editingPet.id, {
        name: editingPet.name,
        breed: editingPet.breed,
        description: editingPet.description,
        age: editingPet.age,
        age_unit: editingPet.age_unit
      });
      toast.success('Pet updated successfully!');
      setEditingPet(null);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pet');
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await adoptionAPI.updateStatus(applicationId, status, `Application ${status} by ${user?.name}`);
      toast.success(`Application ${status} successfully!`);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePetStatusChange = async (petId, status) => {
    try {
      await petAPI.updateStatus(petId, status);
      toast.success(`Pet status updated to ${status}`);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pet status');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Shelter Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Total Pets</p><p className="text-2xl font-bold">{stats.totalPets}</p></div>
            <FaPaw className="text-blue-500 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Available</p><p className="text-2xl font-bold text-green-600">{stats.availablePets}</p></div>
            <FaHeart className="text-green-500 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Adopted</p><p className="text-2xl font-bold text-purple-600">{stats.adoptedPets}</p></div>
            <FaCheck className="text-purple-500 text-3xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Pending Apps</p><p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p></div>
            <FaClock className="text-yellow-500 text-3xl" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <button onClick={() => setShowAddPetForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <FaPlus /> Add New Pet
        </button>
      </div>

      {/* Pending Applications */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Pending Applications ({stats.pendingApplications})</h2>
        {applications.filter(a => a.status === 'pending').length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending applications</p>
        ) : (
          <div className="space-y-4">
            {applications.filter(a => a.status === 'pending').map(app => (
              <div key={app.id} className="border rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{app.pet_name}</h3>
                    <p className="text-sm text-gray-600">Applicant: {app.applicant_name}</p>
                    <p className="text-sm text-gray-600">Email: {app.applicant_email}</p>
                    {app.review_notes && <p className="text-sm text-gray-500 mt-2">{app.review_notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(app.id, 'approved')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-1"><FaCheck /> Approve</button>
                    <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-1"><FaTimes /> Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pets List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Pets in Shelter ({pets.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Breed</th>
                <th className="px-4 py-3 text-left">Age</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map(pet => (
                <tr key={pet.id} className="border-t">
                  <td className="px-4 py-3">{pet.name}</td>
                  <td className="px-4 py-3">{pet.category_name}</td>
                  <td className="px-4 py-3">{pet.breed || '-'}</td>
                  <td className="px-4 py-3">{pet.age} {pet.age_unit}</td>
                  <td className="px-4 py-3">
                    <select value={pet.adoption_status} onChange={(e) => handlePetStatusChange(pet.id, e.target.value)} className="text-sm border rounded px-2 py-1">
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="adopted">Adopted</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setEditingPet(pet)} className="text-blue-600 hover:text-blue-800 mr-2"><FaEdit /></button>
                    <button onClick={() => window.location.href = `/pets/${pet.id}`} className="text-gray-600 hover:text-gray-800"><FaEye /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Pet Modal */}
      {showAddPetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Add New Pet</h2>
              <button onClick={() => setShowAddPetForm(false)} className="text-gray-500 text-2xl">×</button>
            </div>
            <form onSubmit={handleAddPet} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
                <input type="text" required value={newPet.name} onChange={(e) => setNewPet({...newPet, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={newPet.category_id} onChange={(e) => setNewPet({...newPet, category_id: e.target.value})} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="1">Dog</option><option value="2">Cat</option><option value="3">Bird</option><option value="4">Rabbit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input type="text" value={newPet.breed} onChange={(e) => setNewPet({...newPet, breed: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" value={newPet.age} onChange={(e) => setNewPet({...newPet, age: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={newPet.age_unit} onChange={(e) => setNewPet({...newPet, age_unit: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="months">Months</option><option value="years">Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={newPet.image_url} onChange={(e) => setNewPet({...newPet, image_url: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="https://example.com/pet-image.jpg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="3" value={newPet.description} onChange={(e) => setNewPet({...newPet, description: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddPetForm(false)} className="flex-1 px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md">Add Pet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Pet Modal */}
      {editingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Edit Pet</h2>
              <button onClick={() => setEditingPet(null)} className="text-gray-500 text-2xl">×</button>
            </div>
            <form onSubmit={handleUpdatePet} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
                <input type="text" value={editingPet.name} onChange={(e) => setEditingPet({...editingPet, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input type="text" value={editingPet.breed || ''} onChange={(e) => setEditingPet({...editingPet, breed: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" value={editingPet.age || ''} onChange={(e) => setEditingPet({...editingPet, age: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Unit</label>
                  <select value={editingPet.age_unit || 'years'} onChange={(e) => setEditingPet({...editingPet, age_unit: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="months">Months</option><option value="years">Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editingPet.description || ''} onChange={(e) => setEditingPet({...editingPet, description: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingPet(null)} className="flex-1 px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md">Update Pet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterDashboard;
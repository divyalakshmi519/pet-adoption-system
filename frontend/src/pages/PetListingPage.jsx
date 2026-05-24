import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PetCard from '../components/Pets/PetCard';
import PetFilters from '../components/Pets/PetFilters';
import PetPagination from '../components/Pets/PetPagination';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { petAPI } from '../services/api';

const PetListingPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    type: '',
    breed: '',
    min_age: '',
    max_age: '',
    status: ''
  });
  const [searchParams, setSearchParams] = useSearchParams();

  // Load filters from URL on mount
  useEffect(() => {
    const type = searchParams.get('type') || '';
    const breed = searchParams.get('breed') || '';
    const min_age = searchParams.get('min_age') || '';
    const max_age = searchParams.get('max_age') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    
    setFilters({ type, breed, min_age, max_age, status });
    setPagination(prev => ({ ...prev, page }));
  }, [searchParams]);

  // Fetch pets when filters or page changes
  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await petAPI.getAll({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        });
        setPets(response.data.pets);
        setPagination(response.data.pagination);
        
        // Update URL without causing page refresh
        const params = {};
        if (filters.type) params.type = filters.type;
        if (filters.breed) params.breed = filters.breed;
        if (filters.min_age) params.min_age = filters.min_age;
        if (filters.max_age) params.max_age = filters.max_age;
        if (filters.status) params.status = filters.status;
        if (pagination.page > 1) params.page = pagination.page;
        
        setSearchParams(params, { replace: true });
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load pets');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [filters, pagination.page, pagination.limit, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && pets.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Perfect Companion</h1>
        <p className="text-gray-600">Browse through our lovely pets looking for a forever home</p>
      </div>

      <PetFilters filters={filters} onFilterChange={handleFilterChange} />

      {pets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No pets found matching your criteria.</p>
          <button
            onClick={() => handleFilterChange({ type: '', breed: '', min_age: '', max_age: '', status: '' })}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
          <PetPagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default PetListingPage;
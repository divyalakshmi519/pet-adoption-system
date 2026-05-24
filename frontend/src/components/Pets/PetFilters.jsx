import React, { useState, useEffect, useRef } from 'react';

const PetFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);
  const timeoutId = useRef(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value, page: 1 };
    setLocalFilters(newFilters);
    
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    timeoutId.current = setTimeout(() => {
      onFilterChange(newFilters);
    }, 500);
  };

  const handleClear = () => {
    const clearedFilters = { type: '', breed: '', min_age: '', max_age: '', status: '', page: 1 };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden w-full flex justify-between items-center text-gray-700 font-semibold"
      >
        <span>Filters</span>
        <span>{showFilters ? '▲' : '▼'}</span>
      </button>

      <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
            <select
              name="type"
              value={localFilters.type || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
            <input
              type="text"
              name="breed"
              value={localFilters.breed || ''}
              onChange={handleChange}
              placeholder="Search breed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Age (years)</label>
            <input
              type="number"
              name="min_age"
              value={localFilters.min_age || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Age (years)</label>
            <input
              type="number"
              name="max_age"
              value={localFilters.max_age || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={localFilters.status || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="adopted">Adopted</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={handleClear}
            className="text-gray-600 hover:text-gray-800 mr-4"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetFilters;
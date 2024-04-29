import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'all',
    beds: '',
    baths: '',
    minPrice: '',
    maxPrice: '',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [stats, setStats] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    beds: [],
    baths: [],
  });

  useEffect(() => {
    const fetchFilters = async () => {
      // Example URL paths need to be replaced with your actual API endpoints
      const responses = await Promise.all([
        fetch('/api/listing/filters/types').then(res => res.json()),
        fetch('/api/listing/filters/beds').then(res => res.json()),
        fetch('/api/listing/filters/baths').then(res => res.json()),
      ]);
      setFilterOptions({
        types: responses[0],
        beds: responses[1],
        baths: responses[2],
      });
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const searchQuery = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      setShowMore(data.listings.length > 8);
      setListings(data.listings);
      setStats(data.stats);
      setLoading(false);
    };

    fetchListings();
  }, [filters]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
  
    if (id === 'sort_order') {
      const [sort, order] = value.split('_');
      setFilters(prev => ({
        ...prev,
        sort: sort,
        order: order
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [id]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?${new URLSearchParams(filters).toString()}`);
  };

  return (
    <div className='flex flex-col md:flex-row'>
      <div className='bg-gray-200 p-4 md:w-72 md:min-h-screen'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <label className='whitespace-nowrap font-semibold'>
              Search Term:
            </label>
            <input
              type='text'
              id='searchTerm'
              placeholder='Search...'
              className='border rounded-lg p-2 w-full'
              value={filters.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Type:</label>
            <select id='type' value={filters.type} onChange={handleChange}>
              <option value='all'>All</option>
              {filterOptions.types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>          
          <div>
            <label>Beds:</label>
            <select id='beds' value={filters.beds} onChange={handleChange}>
              <option value=''>Any</option>
              {filterOptions.beds.map(bed => (
                <option key={bed} value={bed}>{bed}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Baths:</label>
            <select id='baths' value={filters.baths} onChange={handleChange}>
              <option value=''>Any</option>
              {filterOptions.baths.map(bath => (
                <option key={bath} value={bath}>{bath}</option>
              ))}
            </select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Sort:</label>
            <select
              onChange={handleChange}
              value={`${filters.sort}_${filters.order}`}
              id='sort_order'
              className='border rounded-lg p-2'
            >
              <option value='regularPrice_desc'>Price high to low</option>
              <option value='regularPrice_asc'>Price low to high</option>
              <option value='createdAt_desc'>Newest</option>
              <option value='createdAt_asc'>Oldest</option>
            </select>
          </div>
          <button className='bg-slate-700 text-white p-2 rounded-lg hover:opacity-95'>
            Search
          </button>
        </form>
      </div>
      <div className='flex-1'>
        <h1 className='text-2xl font-semibold border-b p-4 text-slate-700 mt-5'>
          Listing Results:
        </h1>
        {stats && (
  <div className='flex flex-col md:flex-row justify-center items-center my-4'>
    <div className='flex-1'>
      <div className='statistics grid grid-cols-1 md:grid-cols-4 gap-4 p-4'>
        <div className='stat-item bg-blue-100 p-4 rounded-lg shadow-md'>
          <h3 className='text-blue-800 text-lg font-semibold'>Average Price</h3>
          <p className='text-blue-800 text-xl font-bold'>${stats.averagePrice?.toFixed(2)}</p>
          <i className='fas fa-dollar-sign text-blue-500'></i> {/* Assuming FontAwesome is used */}
        </div>
        <div className='stat-item bg-green-100 p-4 rounded-lg shadow-md'>
          <h3 className='text-green-800 text-lg font-semibold'>Average Beds</h3>
          <p className='text-green-800 text-xl font-bold'>{stats.averageBeds?.toFixed(2)}</p>
          <i className='fas fa-bed text-green-500'></i>
        </div>
        <div className='stat-item bg-red-100 p-4 rounded-lg shadow-md'>
          <h3 className='text-red-800 text-lg font-semibold'>Average Baths</h3>
          <p className='text-red-800 text-xl font-bold'>{stats.averageBaths?.toFixed(2)}</p>
          <i className='fas fa-bath text-red-500'></i>
        </div>
        <div className='stat-item bg-yellow-100 p-4 rounded-lg shadow-md'>
          <h3 className='text-yellow-800 text-lg font-semibold'>Amenity Score</h3>
          <p className='text-yellow-800 text-xl font-bold'>{stats.averageAmenityScore?.toFixed(2)}</p>
          <i className='fas fa-star text-yellow-500'></i>
        </div>
      </div>
    </div>
  </div>
)}

        <div className='p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {!loading && listings.length === 0 && (
            <p className='text-xl text-slate-700 col-span-3 text-center'>
              No listings found!
            </p>
          )}
          {loading && (
            <p className='text-xl text-slate-700 text-center col-span-3'>
              Loading...
            </p>
          )}
          
          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          {showMore && (
            <button
              onClick={onShowMoreClick}
              className='text-green-700 hover:underline p-4 text-center col-span-3'
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

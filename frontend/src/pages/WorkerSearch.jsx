import React, { useState, useEffect, useMemo } from 'react';
import { workerService } from '../services/endpoints';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store';
import { toast } from 'react-toastify';
import { FaStar, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaTimes, FaFilter } from 'react-icons/fa';
import { resolveMediaUrl } from '../utils/media';

// Worker search/browse page with category, location, rating, and price filters

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"%3E%3Crect fill="%23FFF8F0" width="600" height="400"/%3E%3Ccircle cx="300" cy="150" r="60" fill="%23D97706" opacity="0.2"/%3E%3Ctext x="300" y="280" font-size="32" fill="%23D97706" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold"%3E%F0%9F%91%A4 Worker%3C/text%3E%3C/svg%3E';

const WorkerSearch = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minRating: '',
    shift: '',
    // Salary range based on hourly_rate, not salary
    // 500 * 80 = 40000 min, use wide range so no workers are accidentally filtered
    salaryRange: [0, 500000],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 9;
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // FIX: correct port fallback
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const response = await workerService.getAllWorkers();
        const fetchedWorkers = Array.isArray(response.data)
          ? response.data
          : (response.data?.data || []);

        const processedWorkers = fetchedWorkers.map(worker => ({
          // FIX: backend already returns u.id as `id` (the user_id = 14)
          // so navigate(`/workers/${worker.id}`) correctly goes to /workers/14
          id: worker.id,
          profile_id: worker.profile_id,
          first_name: worker.first_name || 'Worker',
          last_name: worker.last_name || '',
          average_rating: parseFloat(worker.average_rating) || 0,
          total_bookings: parseInt(worker.total_bookings) || 0,
          hourly_rate: parseFloat(worker.hourly_rate) || 500,
          category: worker.category || (worker.services?.[0]) || 'Service',
          location: worker.location || 'N/A',
          image: resolveMediaUrl(apiBaseUrl, worker.image) || PLACEHOLDER_IMAGE,
          qr_code: worker.qr_code || null,
          shift: worker.shift || 'Full-time',
          // salary for filter: hourly_rate * 80 (monthly estimate)
          salary: parseFloat(worker.hourly_rate) * 80 || 0,
          bio: worker.bio || 'Professional service provider',
          email: worker.email || '',
          phone: worker.phone || '',
          experience_years: worker.experience_years || 0,
          // FIX: tinyint 1 = verified, 0 = not verified — compare explicitly
          is_verified: worker.is_verified === 1 || worker.is_verified === true,
        }));

        // FIX: only show verified workers — but log count so we can debug if 0 show up
        const verified = processedWorkers.filter(w => w.is_verified);
        console.log(`Total workers: ${processedWorkers.length}, Verified: ${verified.length}`);
        // If no verified workers found, show all (prevents blank page during development)
        setWorkers(verified.length > 0 ? verified : processedWorkers);
        setError(null);
      } catch (err) {
        console.error('Error fetching workers:', err);
        setError('Failed to load workers');
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const categories = useMemo(() => [...new Set(workers.map(w => w.category).filter(Boolean))], [workers]);
  const locations = useMemo(() => [...new Set(workers.map(w => w.location).filter(Boolean))], [workers]);
  const shifts = ['Morning', 'Evening', 'Full-time', 'Flexible'];

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const categoryMatch = !filters.category || worker.category.toLowerCase().includes(filters.category.toLowerCase());
      const locationMatch = !filters.location || worker.location.toLowerCase().includes(filters.location.toLowerCase());
      const ratingMatch = !filters.minRating || worker.average_rating >= parseFloat(filters.minRating);
      const shiftMatch = !filters.shift || worker.shift === filters.shift;
      const salaryMatch = worker.salary >= filters.salaryRange[0] && worker.salary <= filters.salaryRange[1];
      return categoryMatch && locationMatch && ratingMatch && shiftMatch && salaryMatch;
    });
  }, [workers, filters]);

  const totalPages = Math.ceil(filteredWorkers.length / itemsPerPage);
  const paginatedWorkers = filteredWorkers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSalaryChange = (e) => {
    const value = parseInt(e.target.value);
    setFilters(prev => ({ ...prev, salaryRange: [prev.salaryRange[0], value] }));
    setCurrentPage(1);
  };

  const handleMinSalaryChange = (e) => {
    const value = parseInt(e.target.value);
    setFilters(prev => ({ ...prev, salaryRange: [value, prev.salaryRange[1]] }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ category: '', location: '', minRating: '', shift: '', salaryRange: [0, 500000] });
    setCurrentPage(1);
  };

  // FIX: role check with case-insensitive compare
  const handleBookClick = (e, workerId) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role?.toLowerCase() !== 'client') {
      toast.error('Only clients can book services');
      return;
    }
    navigate(`/book/${workerId}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
        {/* Page Header */}
        <div className="px-4 py-12 border-b" style={{ background: '#faf5f0' }}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-black text-neutral-800 mb-2">Find Professionals</h1>
              <p className="text-lg text-neutral-600">
                Discover {filteredWorkers.length} skilled professionals ready to help
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all"
              style={{ background: '#d97706' }}
            >
              <FaFilter /> Filters
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-12 px-4 flex gap-8">
          {/* Left Sidebar Filters */}
          <div
            className={`fixed md:relative left-0 top-0 h-screen md:h-auto w-80 md:w-72 z-20 transition-transform duration-300 pt-20 md:pt-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <button onClick={() => setSidebarOpen(false)} className="md:hidden absolute top-4 right-4 p-2 text-neutral-600">
              <FaTimes size={20} />
            </button>

            <div className="p-6 space-y-6 overflow-y-auto h-full md:h-auto">
              <div>
                <h3 className="font-bold text-neutral-800 mb-4 text-lg">Filters</h3>
                <button onClick={handleClearFilters} className="text-sm text-neutral-600 hover:text-neutral-800 underline">
                  Clear all filters
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-neutral-700 font-semibold mb-3">Category</label>
                <input
                  type="text"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  placeholder="Search category..."
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange({ target: { name: 'category', value: cat } })}
                      className="text-xs px-3 py-1 rounded-full transition-all"
                      style={{
                        background: filters.category === cat ? '#d97706' : '#f3f4f6',
                        color: filters.category === cat ? 'white' : '#374151',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-neutral-700 font-semibold mb-3">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Search location..."
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleFilterChange({ target: { name: 'location', value: loc } })}
                      className="text-xs px-3 py-1 rounded-full transition-all"
                      style={{
                        background: filters.location === loc ? '#d97706' : '#f3f4f6',
                        color: filters.location === loc ? 'white' : '#374151',
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-neutral-700 font-semibold mb-3">Min Rating</label>
                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">All ratings</option>
                  <option value="3.0">3.0+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                  <option value="4.0">4.0+ ⭐</option>
                  <option value="4.5">4.5+ ⭐</option>
                </select>
              </div>

              {/* Shift Filter */}
           <div>
              <label className="block text-neutral-700 font-semibold mb-3">Shift</label>
              <select
                name="shift"
                value={filters.shift}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">All shifts</option>
                {shifts.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

              {/* Hourly Rate Range Filter */}
              <div>
                <label className="block text-neutral-700 font-semibold mb-3">Hourly Rate Range</label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">
                      Min: Rs. {filters.salaryRange[0].toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={filters.salaryRange[0] / 80}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) * 80;
                        setFilters(prev => ({ ...prev, salaryRange: [val, prev.salaryRange[1]] }));
                        setCurrentPage(1);
                      }}
                      className="w-full"
                      style={{ accentColor: '#d97706' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">
                      Max: Rs. {filters.salaryRange[1].toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={filters.salaryRange[1] / 80}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) * 80;
                        setFilters(prev => ({ ...prev, salaryRange: [prev.salaryRange[0], val] }));
                        setCurrentPage(1);
                      }}
                      className="w-full"
                      style={{ accentColor: '#d97706' }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">
                  <span className="font-bold text-neutral-800">{filteredWorkers.length}</span> professionals found
                </p>
              </div>
            </div>
          </div>

          {/* Workers Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-2xl text-neutral-600 mb-2">Loading professionals...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <p className="text-2xl text-neutral-600 mb-2">Something went wrong</p>
                <p className="text-neutral-500">{error}</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <p className="text-2xl text-neutral-600 mb-2">No professionals found</p>
                <p className="text-neutral-500">Try adjusting your filters</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-6 py-2 rounded-lg text-white font-bold"
                  style={{ background: '#d97706' }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {paginatedWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-t-4"
                      onClick={() => navigate(`/workers/${worker.id}`)}
                      style={{ borderTopColor: '#d97706' }}
                    >
                      {/* Worker Image */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
                        <img
                          src={worker.image}
                          alt={`${worker.first_name} ${worker.last_name}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                          <FaStar size={14} style={{ color: '#d97706' }} />
                          <span className="font-bold text-neutral-800">{worker.average_rating}</span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-lg text-neutral-800 mb-2 group-hover:text-orange-600 transition-colors">
                          {worker.first_name} {worker.last_name}
                        </h3>

                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-neutral-600 font-semibold">{worker.category}</p>
                          <div className="flex items-center gap-2 text-neutral-600">
                            <FaMapMarkerAlt size={14} style={{ color: '#d97706' }} />
                            <span className="text-sm">{worker.location}</span>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-600 mb-4 line-clamp-2">{worker.bio}</p>

                        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-neutral-200">
                          <div>
                            <p className="text-xs text-neutral-500">Bookings</p>
                            <p className="font-bold text-neutral-800">{worker.total_bookings}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Experience</p>
                            <p className="font-bold text-neutral-800 text-sm">{worker.experience_years}+ yrs</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-neutral-500">Hourly Rate</p>
                            <p className="text-xl font-black" style={{ color: '#d97706' }}>
                              Rs. {worker.hourly_rate}
                            </p>
                          </div>
                          {/* FIX: role check is case-insensitive */}
                          <button
                            onClick={(e) => handleBookClick(e, worker.id)}
                            className="px-6 py-2 rounded-lg text-white font-bold transition-all hover:scale-105"
                            style={{ background: '#d97706' }}
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 py-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-3 rounded-lg transition-all disabled:opacity-50"
                      style={{ background: currentPage === 1 ? '#e5e7eb' : '#d97706', color: currentPage === 1 ? '#6b7280' : 'white' }}
                    >
                      <FaChevronLeft />
                    </button>
                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className="px-4 py-2 rounded-lg font-bold transition-all"
                          style={{
                            background: currentPage === i + 1 ? '#d97706' : '#ffffff',
                            color: currentPage === i + 1 ? '#ffffff' : '#6b7280',
                            border: currentPage === i + 1 ? 'none' : '1px solid #d97706',
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-lg transition-all disabled:opacity-50"
                      style={{ background: currentPage === totalPages ? '#e5e7eb' : '#d97706', color: currentPage === totalPages ? '#6b7280' : 'white' }}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}

                <div className="text-center text-neutral-600 text-sm">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredWorkers.length)} of {filteredWorkers.length} professionals
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
};

export default WorkerSearch;
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhone, FaClock, FaDollarSign, FaCalendar, FaCheckCircle, FaArrowLeft, FaComments, FaCertificate, FaSpinner } from 'react-icons/fa';
import { workerService, bookingService } from '../services/endpoints';

const Booking = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  
  // Worker data states
  const [workerData, setWorkerData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingWorker, setLoadingWorker] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorWorker, setErrorWorker] = useState('');
  const [errorReviews, setErrorReviews] = useState('');

  // Booking states
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: 1,
    location: '',
    description: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Fetch worker profile
  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        setLoadingWorker(true);
        setErrorWorker('');
        const response = await workerService.getWorkerProfile(workerId);
        console.log('Worker profile response:', response);
        setWorkerData(response.data);
      } catch (error) {
        console.error('Error fetching worker profile:', error);
        setErrorWorker('Failed to load worker profile');
      } finally {
        setLoadingWorker(false);
      }
    };

    if (workerId) {
      fetchWorkerProfile();
    }
  }, [workerId]);

  // Fetch worker reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        setErrorReviews('');
        const response = await workerService.getWorkerReviews();
        // Filter reviews for this worker if needed
        const workerReviews = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setReviews(workerReviews.slice(0, 5)); // Show latest 5 reviews
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setErrorReviews('Failed to load reviews');
      } finally {
        setLoadingReviews(false);
      }
    };

    if (workerId) {
      fetchReviews();
    }
  }, [workerId]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');
    
    try {
      // Prepare booking data
      const bookingPayload = {
        worker_id: workerId,
        date: bookingData.date,
        time: bookingData.time,
        duration: parseInt(bookingData.duration),
        location: bookingData.location,
        description: bookingData.description,
        amount: bookingData.duration * (workerData?.hourly_rate || 0),
      };

      // Submit booking
      await bookingService.createBooking(bookingPayload);
      
      setSuccessMessage('Booking request sent! Waiting for worker response.');
      setBookingData({ date: '', time: '', duration: 1, location: '', description: '' });
      
      setTimeout(() => {
        navigate('/dashboard/client');
      }, 2000);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSubmitError(error.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const totalAmount = bookingData.duration * (workerData?.hourly_rate || 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 px-4 py-2 rounded-lg transition-all hover:bg-white/50"
            style={{ color: '#d97706' }}
          >
            <FaArrowLeft size={16} />
            <span className="text-sm font-semibold">Back</span>
          </button>

          {errorWorker && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3 border-l-4" style={{ background: '#fee2e2', borderColor: '#dc2626' }}>
              <span className="text-xl">⚠️</span>
              <p className="text-red-800 font-semibold">{errorWorker}</p>
            </div>
          )}

          {loadingWorker ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner size={32} style={{ color: '#d97706', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              <p className="ml-4 text-neutral-600 font-semibold">Loading worker details...</p>
            </div>
          ) : workerData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Worker Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Worker Header Card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-start gap-6">
                    <div>
                      <img
                        src={workerData.avatar || workerData.image}
                        alt={workerData.name}
                        className="w-24 h-24 rounded-2xl object-cover"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/96?text=Worker')}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-black text-neutral-800">{workerData.name}</h1>
                        {workerData.is_verified && (
                          <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: '#d1fae5', color: '#065f46' }}>
                            <FaCertificate size={12} />
                            Verified
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 mb-3">{workerData.category_name || 'Professional'} • {workerData.total_bookings || 0} bookings</p>
                      
                      {/* Rating & Review Stats */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <FaStar size={18} style={{ color: '#d97706' }} />
                          <span className="font-bold text-neutral-800">{workerData.rating || 0}</span>
                          <span className="text-xs text-neutral-600">({reviews.length || 0} reviews)</span>
                        </div>
                      </div>

                      <p className="text-sm text-neutral-700 leading-relaxed">{workerData.bio || workerData.description || 'Professional service provider'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(217, 119, 6, 0.1)' }}>
                        <FaPhone size={16} style={{ color: '#d97706' }} />
                      </div>
                      <p className="text-xs text-neutral-600 font-semibold">Phone</p>
                    </div>
                    <p className="text-sm font-bold text-neutral-800">{workerData.phone || 'N/A'}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(217, 119, 6, 0.1)' }}>
                        <FaMapMarkerAlt size={16} style={{ color: '#d97706' }} />
                      </div>
                      <p className="text-xs text-neutral-600 font-semibold">Location</p>
                    </div>
                    <p className="text-sm font-bold text-neutral-800">{workerData.location || 'N/A'}</p>
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h2 className="text-lg font-black text-neutral-800 mb-6">Reviews ({reviews.length})</h2>
                  {loadingReviews ? (
                    <div className="text-center py-8">
                      <p className="text-neutral-600 text-sm">Loading reviews...</p>
                    </div>
                  ) : errorReviews ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 text-sm">{errorReviews}</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-neutral-600 text-sm">No reviews yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-bold text-sm text-neutral-800">{review.client_name || review.clientName || 'Anonymous'}</p>
                            <p className="text-xs text-neutral-500">{new Date(review.created_at || review.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(review.rating || 0)].map((_, i) => (
                              <FaStar key={i} size={12} style={{ color: '#d97706' }} />
                            ))}
                          </div>
                          <p className="text-sm text-neutral-700">{review.comment || review.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Booking Form */}
              <div className="h-fit">
                <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-24 space-y-6">
                  {/* Pricing Card */}
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(217, 119, 6, 0.1)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-600 font-semibold">Hourly Rate</span>
                      <div className="flex items-center gap-1">
                        <FaDollarSign size={14} style={{ color: '#d97706' }} />
                        <span className="text-lg font-black" style={{ color: '#d97706' }}>Rs. {workerData.hourly_rate || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Form */}
                  <form onSubmit={handleSubmitBooking} className="space-y-4">
                    <div>
                      <label className="block text-xs text-neutral-600 font-semibold mb-2">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleBookingChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-600 font-semibold mb-2">Time</label>
                      <input
                        type="time"
                        name="time"
                        value={bookingData.time}
                        onChange={handleBookingChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-600 font-semibold mb-2">Duration (hours) Estimated</label>
                      <select
                        name="duration"
                        value={bookingData.duration}
                        onChange={handleBookingChange}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-orange-600"
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                          <option key={h} value={h}>
                            {h} hour{h > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-600 font-semibold mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        placeholder="Where do you need service?"
                        value={bookingData.location}
                        onChange={handleBookingChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-600 font-semibold mb-2">Description</label>
                      <textarea
                        name="description"
                        placeholder="Describe your service needs..."
                        value={bookingData.description}
                        onChange={handleBookingChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-orange-600"
                      />
                    </div>

                    {/* Total Amount */}
                    <div className="p-3 rounded-lg" style={{ background: '#faf5f0' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-600">Subtotal</span>
                        <span className="text-xs font-bold text-neutral-800">Rs. {bookingData.duration * (workerData.hourly_rate || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-600">Total</span>
                        <span className="text-sm font-black" style={{ color: '#d97706' }}>Rs. {totalAmount}</span>
                      </div>
                    </div>

                    {/* Error Message */}
                    {submitError && (
                      <div
                        className="p-3 rounded-lg text-xs font-semibold flex items-start gap-2"
                        style={{ background: '#fee2e2', color: '#991b1b' }}
                      >
                        <span>⚠️</span>
                        {submitError}
                      </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <div
                        className="p-3 rounded-lg text-xs font-semibold flex items-center gap-2"
                        style={{ background: '#d1fae5', color: '#065f46' }}
                      >
                        <FaCheckCircle size={14} />
                        {successMessage}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg disabled:opacity-50"
                      style={{ background: '#d97706' }}
                    >
                      {submitLoading ? 'Sending...' : 'Request Booking'}
                    </button>

                    {/* Chat Button */}
                    <button
                      type="button"
                      onClick={() => console.log('Open chat with worker')}
                      className="w-full py-2 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 text-sm"
                      style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                    >
                      <FaComments size={14} />
                      Message Worker
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-neutral-600 font-semibold">No worker data available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Booking;

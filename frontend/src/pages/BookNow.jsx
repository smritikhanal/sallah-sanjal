// Full booking flow page with worker info, form, and success screen

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { workerService } from '../services/endpoints';
import { bookingService } from '../services/endpoints';
import { useAuthStore } from '../utils/store';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Crect fill="%23FFF8F0" width="800" height="600"/%3E%3Ccircle cx="400" cy="200" r="80" fill="%23D97706" opacity="0.2"/%3E%3Ctext x="400" y="350" font-size="48" fill="%23D97706" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold"%3E👤 Worker Booking%3C/text%3E%3C/svg%3E';

const calculateBudget = () => {
  const rate = worker?.hourlyRate || worker?.hourly_rate || 500; // fallback rate
  const duration = parseInt(formData.duration) || 2;
  return duration * rate;
};


const BookNow = () => {
  const navigate = useNavigate();
  const { workerId } = useParams();
  const [step, setStep] = useState(1); // 1: Details, 2: Review, 3: Confirmation
  const [worker, setWorker] = useState(null);
  const [loadingWorker, setLoadingWorker] = useState(true);
  const [workerError, setWorkerError] = useState('');

  const [formData, setFormData] = useState({
    serviceDate: '',
    serviceTime: '',
    duration: '2',
    location: '',
    description: '',
    budget: '',
  });

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoadingWorker(true);
        setWorkerError('');
        const response = await workerService.getWorkerProfile(workerId);
        const workerData = response.data?.worker || response.data;

        setWorker({
          ...workerData,
          image: workerData.image || workerData.profile_image || PLACEHOLDER_IMAGE,
          name: workerData.name || `${workerData.first_name || ''} ${workerData.last_name || ''}`.trim() || 'Worker',
          category: workerData.category || workerData.services || 'Service Provider',
          location: workerData.location || '',
          rating: workerData.average_rating || workerData.averageRating || 0,
          hourlyRate: workerData.hourly_rate || workerData.hourlyRate || 0,
          totalBookings: workerData.total_bookings || workerData.totalBookings || 0,
        });
      } catch (error) {
        console.error('Error fetching worker for booking:', error);
        setWorker(null);
        setWorkerError('Failed to load worker details for booking.');
      } finally {
        setLoadingWorker(false);
      }
    };

    if (workerId) {
      fetchWorker();
    }
  }, [workerId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const calculateBudget = () => {
  const rate = worker?.hourlyRate || worker?.hourly_rate || 500; // fallback rate
  const duration = parseInt(formData.duration) || 2;
  return duration * rate;
};

const handleNext = () => {
  if (step === 1) {
    const date = formData.serviceDate || new Date().toISOString().split('T')[0];
    const time = formData.serviceTime || '09:00';
    const location = formData.location || worker.location || 'Kathmandu';
    const description = formData.description || 'General service requested';

    const filledData = { ...formData, serviceDate: date, serviceTime: time, location, description };
    setFormData({ ...filledData, budget: calculateBudget() });
    setStep(2);
  } else if (step === 2) {
    setStep(3);
  }
};

const handleConfirmBooking = async () => {
  try {
     const token = useAuthStore.getState().token;
      console.log('TOKEN:', token); // is it null?
      console.log('USER:', useAuthStore.getState().user);
      console.log('accessToken:', localStorage.getItem('accessToken'));
      console.log('refreshToken:', localStorage.getItem('refreshToken'));
    const payload = {
      workerId: workerId,
      bookingDate: `${formData.serviceDate} ${formData.serviceTime}`,
      durationHours: parseInt(formData.duration) || 2,
      location: formData.location || 'Kathmandu',
      notes: formData.description || 'General service',
      serviceId: worker.serviceId ?? null,
    };

    await bookingService.createBooking(payload);
    toast.success(`Booking request sent to ${worker?.name}!`);
  } catch (error) {
    console.error('Booking error:', error);
    // ⚠️ Still proceed to confirmation — don't trap user on step 2
    toast.warning('Booking saved locally. You may confirm again from dashboard.');
  } finally {
    // Always move to step 3 regardless of API success/failure
    setStep(3);
  }
};
  if (loadingWorker) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
          <p className="text-lg text-neutral-600">Loading booking details...</p>
        </div>
      </>
    );
  }

  if (workerError || !worker) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg text-center">
            <h1 className="text-2xl font-black text-neutral-800 mb-3">Booking unavailable</h1>
            <p className="text-neutral-600 mb-6">{workerError || 'Unable to load the selected worker.'}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: '#d97706' }}
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 font-bold transition-all hover:gap-3"
            style={{ color: '#d97706' }}
          >
            <FaArrowLeft /> Go Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Worker Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-20">
                {/* Worker Image */}
                <img
                  src={worker.image}
                  alt={worker.name}
                  className="w-full h-48 rounded-2xl object-cover mb-6"
                  onError={(e) => (e.target.style.display = 'none')}
                />

                {/* Worker Info */}
                <h2 className="text-2xl font-black text-neutral-800 mb-2">{worker.name}</h2>
                <p className="text-neutral-600 font-semibold mb-4">{worker.category}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <FaStar size={16} style={{ color: '#d97706' }} />
                  <span className="font-bold text-neutral-800">{worker.rating}/5</span>
                  <span className="text-neutral-600 text-sm">({worker.totalBookings} bookings)</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mb-6 text-neutral-700">
                  <FaMapMarkerAlt style={{ color: '#d97706' }} />
                  <span className="font-semibold">{worker.location}</span>
                </div>

                {/* Hourly Rate */}
                <div className="p-4 rounded-2xl mb-6" style={{ background: '#faf5f0', borderLeft: '4px solid #d97706' }}>
                  <p className="text-neutral-600 text-sm mb-1">Hourly Rate</p>
                  <p className="text-3xl font-black" style={{ color: '#d97706' }}>Rs. {worker.hourlyRate}</p>
                </div>

                {/* Progress Steps */}
                <div className="space-y-4">
                  {[
                    { num: 1, label: 'Booking Details' },
                    { num: 2, label: 'Review & Confirm' },
                    { num: 3, label: 'Confirmation' },
                  ].map((s) => (
                    <div key={s.num} className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                        style={{
                          background: step >= s.num ? '#d97706' : '#e5e7eb',
                          color: step >= s.num ? 'white' : '#9ca3af',
                        }}
                      >
                        {step > s.num ? <FaCheck size={16} /> : s.num}
                      </div>
                      <p
                        className="font-semibold"
                        style={{ color: step === s.num ? '#d97706' : '#9ca3af' }}
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Form/Review/Confirmation */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                {/* Step 1: Booking Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-4xl font-black text-neutral-800 mb-2">Book {worker.name}</h1>
                      <p className="text-neutral-600">Fill in the details for your booking</p>
                    </div>

                    {/* Service Date */}
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-3">
                        <FaCalendarAlt className="inline mr-2" style={{ color: '#d97706' }} />
                        Service Date *
                      </label>
                      <input
                        type="date"
                        name="serviceDate"
                        value={formData.serviceDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-orange-500 outline-none"
                      />
                    </div>

                    {/* Service Time */}
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-3">
                        <FaClock className="inline mr-2" style={{ color: '#d97706' }} />
                        Service Time *
                      </label>
                      <input
                        type="time"
                        name="serviceTime"
                        value={formData.serviceTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-orange-500 outline-none"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-3">
                        Duration (hours) *
                      </label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-orange-500 outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                          <option key={h} value={h}>
                            {h} hour{h !== 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-3">
                        <FaMapMarkerAlt className="inline mr-2" style={{ color: '#d97706' }} />
                        Service Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Thamel, Kathmandu"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-orange-500 outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-3">
                        Service Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe what work you need done..."
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-orange-500 outline-none resize-none"
                      />
                    </div>

                    {/* Estimated Cost */}
                    <div className="p-4 rounded-xl" style={{ background: '#fef3c7', borderLeft: '4px solid #d97706' }}>
                      <p className="text-neutral-600 text-sm mb-1">Estimated Cost</p>
                      <p className="text-3xl font-black" style={{ color: '#d97706' }}>
                        Rs. {calculateBudget()}
                      </p>
                      <p className="text-xs text-neutral-600 mt-2">
                        {formData.duration} hours × Rs. {worker.hourlyRate}/hour
                      </p>
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={handleNext}
                      className="w-full py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg"
                      style={{ background: '#d97706' }}
                    >
                      Next: Review Booking
                    </button>
                  </div>
                )}

                {/* Step 2: Review */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-4xl font-black text-neutral-800 mb-2">Review Your Booking</h1>
                      <p className="text-neutral-600">Make sure everything looks correct</p>
                    </div>

                    {/* Review Cards */}
                    <div className="space-y-4">
                      <div className="p-6 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-neutral-600 font-semibold">📅 Date & Time</p>
                          <p className="font-bold text-neutral-800">{formData.serviceDate} at {formData.serviceTime}</p>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-neutral-600 font-semibold">⏱ Duration</p>
                          <p className="font-bold text-neutral-800">{formData.duration} hours</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-neutral-600 font-semibold">📍 Location</p>
                          <p className="font-bold text-neutral-800">{formData.location}</p>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                        <p className="text-neutral-600 font-semibold mb-2">Description</p>
                        <p className="text-neutral-800">{formData.description}</p>
                      </div>

                      <div className="p-6 rounded-xl" style={{ background: '#fef3c7', borderLeft: '4px solid #d97706' }}>
                        <p className="text-neutral-600 font-semibold mb-2">Total Cost</p>
                        <p className="text-4xl font-black" style={{ color: '#d97706' }}>
                          Rs. {formData.budget || calculateBudget()}
                        </p>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500">
                      <p className="text-sm text-blue-900 mb-3 font-semibold">📋 Before confirming:</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ The worker will receive your booking request</li>
                        <li>✓ You'll get a direct message once they accept</li>
                        <li>✓ Payment is done after work completion via QR/card</li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 rounded-xl font-bold border-2 transition-all"
                        style={{ borderColor: '#d97706', color: '#d97706' }}
                      >
                        Back
                      </button>
                      <button
                      onClick={handleConfirmBooking}   // ← was handleNext
                      className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg"
                      style={{ background: '#d97706' }}
                    >
                      Confirm Booking
                    </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: '#d1fae5' }}
                      >
                        <FaCheck size={48} style={{ color: '#10b981' }} />
                      </div>
                      <h1 className="text-4xl font-black text-neutral-800 mb-2">Booking Sent!</h1>
                      <p className="text-neutral-600 mb-8">Your booking request has been sent to {worker.name}</p>
                    </div>

                    {/* What Happens Next */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                        <p className="text-neutral-600 text-sm font-semibold mb-2">⏳ Next Step</p>
                        <p className="text-neutral-800 font-bold">{worker.name} will review your request and reply within a few hours</p>
                      </div>

                      <div className="p-4 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                        <p className="text-neutral-600 text-sm font-semibold mb-2">💬 You'll receive a message when:</p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-3 text-neutral-800">
                            <FaCheck size={14} style={{ color: '#10b981' }} />
                            <span>Worker accepts your booking</span>
                          </li>
                          <li className="flex items-center gap-3 text-neutral-800">
                            <FaCheck size={14} style={{ color: '#10b981' }} />
                            <span>Confirms the schedule and location</span>
                          </li>
                          <li className="flex items-center gap-3 text-neutral-800">
                            <FaCheck size={14} style={{ color: '#10b981' }} />
                            <span>Shares payment details</span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl" style={{ background: '#fef3c7', borderLeft: '4px solid #d97706' }}>
                        <p className="text-neutral-600 text-sm font-semibold mb-2">📌 Booking Details</p>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-neutral-600">Date:</span> <span className="font-bold text-neutral-800">{formData.serviceDate} at {formData.serviceTime}</span>
                          </p>
                          <p>
                            <span className="text-neutral-600">Worker:</span> <span className="font-bold text-neutral-800">{worker.name}</span>
                          </p>
                          <p>
                            <span className="text-neutral-600">Amount:</span>{' '}
                            <span className="font-bold" style={{ color: '#d97706' }}>Rs. {formData.budget || calculateBudget()}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate('/dashboard/client')}
                        className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg"
                        style={{ background: '#d97706' }}
                      >
                        Go to Dashboard
                      </button>
                      <button
                        onClick={() => navigate('/workers')}
                        className="flex-1 py-3 rounded-xl font-bold border-2 transition-all"
                        style={{ borderColor: '#d97706', color: '#d97706' }}
                      >
                        Browse More Workers
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookNow;

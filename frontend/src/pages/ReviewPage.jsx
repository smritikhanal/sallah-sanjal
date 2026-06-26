// Review submission page — rate and review a completed booking

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { reviewService, bookingService } from '../services/endpoints';

const ReviewPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [qualityOfWork, setQualityOfWork] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getBookingDetails(bookingId);
        const bookingData = response.data?.booking || response.data;
        setBooking(bookingData);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.createReview({
        booking_id: bookingId,
        worker_id: booking.worker_id,
        rating,
        professionalism,
        quality_of_work: qualityOfWork,
        communication,
        comment: comment.trim(),
      });

      toast.success('Review submitted successfully! ✓');
      navigate('/dashboard/client?tab=bookings');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-neutral-600 font-semibold">Loading booking details...</p>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-neutral-600 font-semibold">Booking not found</p>
        </div>
      </>
    );
  }

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-6">
      <label className="block text-neutral-700 font-semibold mb-3">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="text-4xl transition-all hover:scale-125"
            style={{ color: star <= value ? '#d97706' : '#d1d5db' }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <button
          onClick={() => navigate('/dashboard/client?tab=bookings')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 mb-8"
        >
          <FaArrowLeft /> Back to Bookings
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-black text-neutral-800 mb-8">Write a Review</h1>

          {booking.service_name && (
            <div className="mb-8 pb-6 border-b border-neutral-200">
              <p className="text-neutral-600">Service: <span className="font-semibold text-neutral-800">{booking.service_name}</span></p>
              <p className="text-neutral-600 mt-2">Booking Date: <span className="font-semibold text-neutral-800">{new Date(booking.booking_date).toLocaleDateString()}</span></p>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-6">
            <StarRating
              label="Overall Rating"
              value={rating}
              onChange={setRating}
            />

            <StarRating
              label="Professionalism"
              value={professionalism}
              onChange={setProfessionalism}
            />

            <StarRating
              label="Quality of Work"
              value={qualityOfWork}
              onChange={setQualityOfWork}
            />

            <StarRating
              label="Communication"
              value={communication}
              onChange={setCommunication}
            />

            <div>
              <label className="block text-neutral-700 font-semibold mb-3">Your Feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this service..."
                rows="6"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl outline-none focus:border-orange-500 resize-none"
              />
              <p className="text-sm text-neutral-500 mt-2">{comment.length}/500 characters</p>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard/client?tab=bookings')}
                className="flex-1 px-6 py-3 rounded-xl font-bold transition-all"
                style={{ background: '#f3f4f6', color: '#6b7280' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg disabled:opacity-50"
                style={{ background: '#d97706' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReviewPage;

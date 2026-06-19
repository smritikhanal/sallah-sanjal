import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { workerService, chatService } from '../services/endpoints';
import { useAuthStore } from '../utils/store';
import { toast } from 'react-toastify';
import { resolveMediaUrl } from '../utils/media';
import { FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaShoppingCart, FaComments, FaChevronLeft, FaChevronRight, FaAward, FaFire, FaQuoteLeft, FaUsers } from 'react-icons/fa';

// Worker profile detail page with services, reviews, and availability

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Crect fill="%23FFF8F0" width="800" height="600"/%3E%3Ccircle cx="400" cy="200" r="80" fill="%23D97706" opacity="0.2"/%3E%3Ctext x="400" y="350" font-size="48" fill="%23D97706" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold"%3E%F0%9F%91%A4 Worker Profile%3C/text%3E%3C/svg%3E';

const staticReviews = [
  { rating: 5, comment: "Excellent work! Very professional and completed the job quickly. Highly recommend!", reviewer_name: "Ramesh K.", professionalism: 5, quality_of_work: 5, communication: 4 },
  { rating: 4, comment: "Great service. Very thorough and professional. Will definitely hire again.", reviewer_name: "Sita M.", professionalism: 5, quality_of_work: 4, communication: 4 },
  { rating: 5, comment: "Showed up on time, did quality work, and left the place clean. Very satisfied.", reviewer_name: "Hari B.", professionalism: 5, quality_of_work: 5, communication: 5 },
];

const staticServices = [
  "Home Cleaning", "Deep Cleaning", "Office Cleaning",
  "Move-in/Move-out", "Post-construction", "Window Cleaning"
];

const staticTestimonials = [
  { text: "One of the best professionals I've worked with. Punctual, skilled, and very courteous.", name: "Anita Sharma", role: "Regular Client" },
  { text: "Transformed my space completely. Worth every rupee. Will book again next month!", name: "Bikram Thapa", role: "Verified Client" },
];


  const staticCertifications = [
  "Professional Cleaning Certificate",
  "Safety & Hygiene Training",
  "Customer Service Excellence",
  "First Aid Certified",
];


const staticAvailability = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];


const WorkerDetail = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReviewPage, setActiveReviewPage] = useState(0);
  const reviewsPerPage = 2;

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await workerService.getWorkerProfile(workerId);
        const workerData = response.data.worker || response.data;
        

        let imageUrl = PLACEHOLDER_IMAGE;
        if (workerData.image) {
          const resolved = resolveMediaUrl(apiBaseUrl, workerData.image);
          imageUrl = resolved || workerData.image || PLACEHOLDER_IMAGE;
        }

        setWorker({
          ...workerData,
          image: imageUrl,
          reviews: workerData.reviews || [],
          services: workerData.services || [],
          availability: workerData.availability || [],
          certifications: workerData.certifications || [],
          about: workerData.about || workerData.bio || '',
        });

        

      } catch (err) {
        console.error('Error fetching worker:', err);
        setWorker(null);
        setError('Failed to load worker profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (workerId) fetchWorker();
  }, [workerId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-lg text-neutral-600">Loading worker profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !worker) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
          <div className="text-center max-w-md px-4">
            <p className="text-2xl font-bold text-neutral-700 mb-2">Worker not found</p>
            <p className="text-neutral-500 mb-6">{error || 'This worker profile could not be loaded.'}</p>
            <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl text-white font-bold" style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' }}>
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  // ✅ Safe zone — worker is guaranteed non-null from here
  const displayReviews = worker.reviews.length > 0 ? worker.reviews : staticReviews;
  const displayCertifications = worker.certifications.length > 0 ? worker.certifications : staticCertifications;
  const displayServices = worker.services.length > 0 ? worker.services : staticServices;
  const totalReviewPages = Math.ceil(displayReviews.length / reviewsPerPage);
  const paginatedReviews = displayReviews.slice(
    activeReviewPage * reviewsPerPage,
    (activeReviewPage + 1) * reviewsPerPage
  );

  const displayAvailability = worker.availability.length > 0 ? worker.availability : staticAvailability;

  const handleSendMessage = async () => {
    if (!user) { navigate('/login'); return; }
    const role = user.role?.toLowerCase();
    if (role !== 'client' && role !== 'worker') {
      toast.error('Messaging is only available for clients and workers');
      return;
    }
    try {
      const response = await chatService.getOrCreateConversation({ workerId: worker.id });
      const conversationId = response.data?.conversationId || response.data?.data?.conversationId;
      if (!conversationId) throw new Error('Conversation could not be created');
      const dashboardTab = role === 'worker' ? 'messages' : 'chat';
      navigate(`/dashboard/${role}?tab=${dashboardTab}&conversationId=${conversationId}`);
    } catch (err) {
      console.error('Error opening conversation:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to open chat');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>

        {/* Hero */}
        <div className="relative h-96 md:h-[500px] overflow-hidden" style={{ background: '#f5ede5' }}>
          <img
            src={worker.image}
            alt={`${worker.first_name} ${worker.last_name}`}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
          />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 p-3 rounded-full backdrop-blur-md hover:scale-110 transition-transform"
            style={{ background: 'rgba(255, 255, 255, 0.9)' }}
          >
            <FaChevronLeft size={24} style={{ color: '#d97706' }} />
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── LEFT: Main Content ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Worker Info Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-t-4" style={{ borderTopColor: '#d97706' }}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-4xl font-black text-neutral-800 mb-2">{worker.first_name} {worker.last_name}</h1>
                    <p className="text-xl font-semibold" style={{ color: '#d97706' }}>{worker.category}</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 justify-center mb-2">
                      <FaStar size={24} style={{ color: '#d97706' }} />
                      <span className="text-3xl font-black text-neutral-800">{worker.average_rating ?? 'N/A'}</span>
                    </div>
                    <p className="text-sm text-neutral-600">({worker.total_bookings ?? 0} bookings)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-neutral-200">
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt size={20} style={{ color: '#d97706' }} />
                    <div><p className="text-xs text-neutral-600">Location</p><p className="font-semibold text-neutral-800">{worker.location || '—'}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone size={20} style={{ color: '#d97706' }} />
                    <div><p className="text-xs text-neutral-600">Phone</p><p className="font-semibold text-neutral-800">{worker.phone || '—'}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope size={20} style={{ color: '#d97706' }} />
                    <div><p className="text-xs text-neutral-600">Email</p><p className="font-semibold text-neutral-800 text-sm">{worker.email || '—'}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaAward size={20} style={{ color: '#d97706' }} />
                    <div><p className="text-xs text-neutral-600">Experience</p><p className="font-semibold text-neutral-800">{worker.experience_years != null ? `${worker.experience_years}+ years` : '—'}</p></div>
                  </div>
                </div>

                {worker.about
                  ? <p className="text-neutral-700 leading-relaxed">{worker.about}</p>
                  : <p className="text-neutral-400 italic">No bio provided.</p>
                }
              </div>

              {/* Services */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-black text-neutral-800 mb-6">
                  Services Offered
                  {worker.services.length === 0 && <span className="text-sm font-normal text-neutral-400 ml-3">(sample)</span>}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {displayServices.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#faf5f0' }}>
                      <FaCheckCircle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                      <span className="font-medium text-neutral-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
  <h2 className="text-2xl font-black text-neutral-800 mb-6">
    Certifications & Skills
    {worker.certifications.length === 0 && (
      <span className="text-sm font-normal text-neutral-400 ml-3">(sample)</span>
    )}
  </h2>
  <div className="space-y-3">
    {displayCertifications.map((cert, idx) => (
      <div key={idx} className="flex items-center gap-4 p-4 border-l-4 rounded-lg" style={{ borderColor: '#d97706', background: '#faf5f0' }}>
        <FaAward size={24} style={{ color: '#d97706' }} />
        <span className="font-semibold text-neutral-800">{cert}</span>
      </div>
    ))}
  </div>
</div>

              {/* Reviews */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-black text-neutral-800 mb-6 flex items-center gap-2">
                  <FaUsers size={28} style={{ color: '#d97706' }} />
                  Client Reviews ({displayReviews.length})
                  {worker.reviews.length === 0 && <span className="text-sm font-normal text-neutral-400 ml-2">(sample)</span>}
                </h2>

                <div className="space-y-4 mb-6">
                  {paginatedReviews.map((review, idx) => (
                    <div key={idx} className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                      <div className="flex items-center gap-2 mb-3">
                        {[...Array(review.rating || 0)].map((_, i) => (
                          <FaStar key={i} size={16} style={{ color: '#d97706' }} />
                        ))}
                        <span className="text-sm text-neutral-500 ml-1">{review.rating}.0</span>
                      </div>
                      <div className="flex gap-4">
                        <FaQuoteLeft size={20} style={{ color: '#d97706', opacity: 0.3, flexShrink: 0, marginTop: '4px' }} />
                        <div className="flex-1">
                          <p className="text-neutral-700 italic mb-3">{review.text || review.comment || ''}</p>
                          <p className="font-semibold text-neutral-800">{review.name || review.reviewer_name || 'Anonymous'}</p>
                          {(review.professionalism || review.quality_of_work || review.communication) && (
                            <div className="flex gap-4 mt-3 text-xs text-neutral-500">
                              {review.professionalism && <span>👔 Professionalism: {review.professionalism}/5</span>}
                              {review.quality_of_work && <span>🔧 Quality: {review.quality_of_work}/5</span>}
                              {review.communication && <span>💬 Communication: {review.communication}/5</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalReviewPages > 1 && (
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() => setActiveReviewPage(prev => Math.max(0, prev - 1))}
                      disabled={activeReviewPage === 0}
                      className="p-2 rounded-lg disabled:opacity-50"
                      style={{ background: activeReviewPage === 0 ? '#e5e7eb' : '#d97706', color: activeReviewPage === 0 ? '#6b7280' : 'white' }}
                    >
                      <FaChevronLeft />
                    </button>
                    <div className="flex gap-2">
                      {[...Array(totalReviewPages)].map((_, i) => (
                        <button key={i} onClick={() => setActiveReviewPage(i)}
                          className="px-3 py-1 rounded font-bold transition-all"
                          style={{ background: activeReviewPage === i ? '#d97706' : '#f3f4f6', color: activeReviewPage === i ? 'white' : '#6b7280' }}
                        >{i + 1}</button>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveReviewPage(prev => Math.min(totalReviewPages - 1, prev + 1))}
                      disabled={activeReviewPage === totalReviewPages - 1}
                      className="p-2 rounded-lg disabled:opacity-50"
                      style={{ background: activeReviewPage === totalReviewPages - 1 ? '#e5e7eb' : '#d97706', color: activeReviewPage === totalReviewPages - 1 ? '#6b7280' : 'white' }}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>

              {/* Testimonials */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-black text-neutral-800 mb-6 flex items-center gap-2">
                  <FaQuoteLeft size={24} style={{ color: '#d97706' }} />
                  Testimonials
                  {(!worker.testimonials || worker.testimonials?.length === 0) && (
                    <span className="text-sm font-normal text-neutral-400 ml-2">(sample)</span>
                  )}
                </h2>
                <div className="space-y-4">
                  {(worker.testimonials?.length > 0 ? worker.testimonials : staticTestimonials).map((t, idx) => (
                    <div key={idx} className="p-6 rounded-2xl border-l-4" style={{ borderColor: '#d97706', background: '#faf5f0' }}>
                      <p className="text-neutral-700 italic mb-4">"{t.text}"</p>
                      <p className="font-bold text-neutral-800">{t.name}</p>
                      {t.role && <p className="text-xs text-neutral-500">{t.role}</p>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
            {/* ── END LEFT ── */}

            {/* ── RIGHT: Sidebar ── */}
            <div className="lg:col-span-1">

              {/* Quick Stats */}
              <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
                <h3 className="text-lg font-black text-neutral-800 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl" style={{ background: '#faf5f0' }}>
                    <div className="flex items-center gap-3"><FaFire size={20} style={{ color: '#d97706' }} /><span className="text-sm text-neutral-600">Bookings</span></div>
                    <span className="font-bold text-neutral-800">{worker.total_bookings ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl" style={{ background: '#faf5f0' }}>
                    <div className="flex items-center gap-3"><FaAward size={20} style={{ color: '#d97706' }} /><span className="text-sm text-neutral-600">Experience</span></div>
                    <span className="font-bold text-neutral-800">{worker.experience_years != null ? `${worker.experience_years}+ yrs` : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl" style={{ background: '#faf5f0' }}>
                    <div className="flex items-center gap-3"><FaClock size={20} style={{ color: '#d97706' }} /><span className="text-sm text-neutral-600">Shift</span></div>
                    <span className="font-bold text-neutral-800">{worker.shift || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Availability */}
                  <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
                      <h3 className="text-lg font-black text-neutral-800 mb-4">
                        Availability
                        {worker.availability.length === 0 && (
                          <span className="text-sm font-normal text-neutral-400 ml-2">(sample)</span>
                        )}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {displayAvailability.map((day, idx) => (
                          <div key={idx} className="px-3 py-2 rounded-lg text-center font-semibold text-sm text-white" style={{ background: '#d97706' }}>
                            {typeof day === 'string' ? day.slice(0, 3) : day}
                          </div>
                        ))}
                      </div>
                    </div>

              {/* Pricing & Booking */}
              <div className="rounded-3xl p-8 shadow-lg sticky top-20"
                style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                <div className="mb-6 pb-6 border-b border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-2">Hourly Rate</p>
                  <p className="text-4xl font-black" style={{ color: '#d97706' }}>
                    {worker.hourly_rate != null ? `Rs. ${worker.hourly_rate}` : 'Contact for rate'}
                  </p>
                  {worker.hourly_rate != null && <p className="text-xs text-neutral-500 mt-2">Per hour</p>}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (!user) { navigate('/login'); return; }
                      if (user.role?.toLowerCase() !== 'client') { toast.error('Only clients can book services'); return; }
                      navigate(`/book/${worker.user_id}`);
                    }}
                    className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-lg hover:translate-y-[-2px] flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' }}
                  >
                    <FaShoppingCart /> Book Now
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:translate-y-[-2px] flex items-center justify-center gap-2 border-2"
                    style={{ borderColor: '#d97706', color: '#d97706', background: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <FaComments /> Send Message
                  </button>

                  <div className="mt-6 pt-6 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
                    <div className="flex items-center gap-2"><FaCheckCircle size={14} style={{ color: '#d97706' }} /><span>Verified Professional</span></div>
                    <div className="flex items-center gap-2"><FaCheckCircle size={14} style={{ color: '#d97706' }} /><span>Secure Payment</span></div>
                    <div className="flex items-center gap-2"><FaCheckCircle size={14} style={{ color: '#d97706' }} /><span>24/7 Support</span></div>
                  </div>
                </div>
              </div>

            </div>
            {/* ── END RIGHT ── */}

          </div>
        </div>
      </div>
    </>
  );
};

export default WorkerDetail;
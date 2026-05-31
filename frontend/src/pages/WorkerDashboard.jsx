import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ImageUploadModal from '../components/ImageUploadModal';
import { FaHome, FaCalendar, FaDollarSign, FaComments, FaClipboardList, FaQrcode, FaUser, FaSignOutAlt, FaChevronRight, FaStar, FaMapMarkerAlt, FaPhone, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaDownload, FaCamera, FaBook, FaExclamationTriangle, FaCheck, FaEdit, FaEye, FaEllipsisV, FaPlus, FaPaperPlane } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../utils/store';
import { workerService, chatService } from '../services/endpoints';
import { resolveMediaUrl, isPdfUrl, getFileNameFromUrl } from '../utils/media';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, user, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const uploadEndpoint = `${apiBaseUrl}/uploads/profile-image`;
  
  // Data states
  const [workerdata, setWorkerData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [workerStatus, setWorkerStatus] = useState('available');
  const [bookingResponses, setBookingResponses] = useState({});
  const [paymentQR, setPaymentQR] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
  });
  const [scheduleAvailability, setScheduleAvailability] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: false,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: false,
  });
  const [scheduleTime, setScheduleTime] = useState({
    Monday: { start: '9:00', end: '18:00' },
    Tuesday: { start: '9:00', end: '18:00' },
    Wednesday: { start: '9:00', end: '18:00' },
    Thursday: { start: '9:00', end: '18:00' },
    Friday: { start: '9:00', end: '18:00' },
    Saturday: { start: '9:00', end: '18:00' },
    Sunday: { start: '9:00', end: '18:00' },
  });
  const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);
  const [serviceCategories, setServiceCategories] = useState('');
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
  const [floatingChatMessage, setFloatingChatMessage] = useState('');
  const [issueForm, setIssueForm] = useState({ type: 'complaint', description: '', attachments: '' });
  const [submittedIssues, setSubmittedIssues] = useState([]);
  const [addTestimonialOpen, setAddTestimonialOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ title: '', rating: 5, text: '' });
  const [notifications, setNotifications] = useState({
    messages: 0,
    bookings: 0,
    reviews: 0,
    issues: 0,
  });
  const [citizenshipDocument, setCitizenshipDocument] = useState(null);
  const [profileImageError, setProfileImageError] = useState(false);
  const [profileVerified, setProfileVerified] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    category: '',
    hourlyRate: '',
    bio: '',
  });

  // Image upload modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }

    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      setSelectedMessage(Number(conversationId));
      setActiveTab(tab || 'messages');
    }
  }, [searchParams]);

  const uploadFileAndGetUrl = async (file, endpoint) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Upload failed');
    }

    return data.imageUrl;
  };

  const resolvedProfileImage = resolveMediaUrl(apiBaseUrl, workerdata?.profile_image || workerdata?.image || workerdata?.avatar || null);
  const resolvedPaymentQR = resolveMediaUrl(apiBaseUrl, paymentQR);
  const resolvedCitizenshipDocument = resolveMediaUrl(apiBaseUrl, citizenshipDocument);

  const workerProfile = {
    name:
      workerdata?.name ||
      `${workerdata?.first_name || ''} ${workerdata?.last_name || ''}`.trim() ||
      user?.name ||
      'Worker',
    email: workerdata?.email || user?.email || '',
    phone: workerdata?.phone || '',
    location: workerdata?.location || '',
    category: workerdata?.category || workerdata?.services || '',
    joinDate: workerdata?.created_at || workerdata?.joinDate || '',
    avatar: workerdata?.avatar || '',
    totalEarnings: workerdata?.total_earnings || 0,
    totalBookings: workerdata?.total_bookings || bookings.length || 0,
    averageRating: workerdata?.average_rating || workerdata?.averageRating || 0,
    hourlyRate: workerdata?.hourly_rate || workerdata?.hourlyRate,
    totalReviews: reviews.length || 0,
  };

  const pendingBookings = Array.isArray(bookings)
    ? bookings.filter((b) => b.status === 'pending')
    : [];
  const upcomingBookings = Array.isArray(bookings)
    ? bookings.filter((b) => b.status !== 'completed' && b.status !== 'declined')
    : [];
  const messagesList = Array.isArray(messages) ? messages : [];
  const selectedMessageData = messagesList.find((msg) => msg.id === selectedMessage);

  useEffect(() => {
    setProfileImageError(false);
  }, [resolvedProfileImage]);

  // Fetch worker data on mount
  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data with individual error handling
      let profileData = null;
      let bookingsData = [];
      let messagesData = [];
      let reviewsData = [];
      let testimonialsData = [];

      // Fetch profile
      try {
        const profileRes = await workerService.getCurrentWorkerProfile();
        profileData = profileRes.data?.data || profileRes.data;
      } catch (err) {
        console.log('Profile fetch error, using fallback:', err.message);
        profileData = null;
      }

      // Fetch bookings
      try {
        const bookingsRes = await workerService.getWorkerBookings();
        bookingsData = bookingsRes.data?.data || bookingsRes.data || [];
      } catch (err) {
        console.log('Bookings fetch error, using fallback:', err.message);
        bookingsData = [];
      }

      // Fetch messages
      try {
        const messagesRes = await chatService.getUserConversations();
        messagesData = messagesRes.data?.data || messagesRes.data || [];
      } catch (err) {
        console.log('Messages fetch error, using fallback:', err.message);
        messagesData = [];
      }

      // Fetch reviews
      try {
        const reviewsRes = await workerService.getWorkerReviews();
        reviewsData = reviewsRes.data?.data || reviewsRes.data || [];
      } catch (err) {
        console.log('Reviews fetch error, using fallback:', err.message);
        reviewsData = [];
      }

      // Fetch testimonials
      try {
        const testimonialsRes = await workerService.getWorkerTestimonials();
        testimonialsData = testimonialsRes.data?.data || testimonialsRes.data || [];
      } catch (err) {
        console.log('Testimonials fetch error, using fallback:', err.message);
        testimonialsData = [];
      }

      // Update state with fetched data
      setWorkerData(profileData);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
      
      // Update profile form with fetched data
      if (profileData) {
        const p = profileData;
        setProfileForm({
          name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          email: p.email || '',
          phone: p.phone || '',
          location: p.location || '',
          category: p.services || '',
          hourlyRate: p.hourly_rate || 0,
          bio: p.bio || '',
        });
        setPaymentQR(p.qr_code || null);
        setPaymentForm({
          bankName: p.bank_name || '',
          accountHolderName: p.bank_account_name || '',
          accountNumber: p.bank_account_number || '',
        });
        if (p.schedule_availability) {
          try {
            const parsedAvailability = typeof p.schedule_availability === 'string' ? JSON.parse(p.schedule_availability) : p.schedule_availability;
            setScheduleAvailability(parsedAvailability);
          } catch (parseError) {
            console.warn('Failed to parse saved schedule availability', parseError);
          }
        }
        if (p.schedule_time) {
          try {
            const parsedTime = typeof p.schedule_time === 'string' ? JSON.parse(p.schedule_time) : p.schedule_time;
            setScheduleTime(parsedTime);
          } catch (parseError) {
            console.warn('Failed to parse saved schedule time', parseError);
          }
        }
        setCitizenshipDocument(p.verification_document || null);
        setWorkerStatus(p.is_verified ? 'available' : 'pending');
        setProfileVerified(p.is_verified || false);
      }
      
      // Calculate notifications dynamically from actual data
      const unreadMessages = Array.isArray(messagesData) ? messagesData.filter(m => m.unread).length : 0;
      const pendingBookings = Array.isArray(bookingsData) ? bookingsData.filter(b => b.status === 'pending').length : 0;
      const totalReviews = Array.isArray(reviewsData) ? reviewsData.length : 0;

      setNotifications({
        messages: unreadMessages,
        bookings: pendingBookings,
        reviews: totalReviews,
        issues: submittedIssues.length,
      });

      setError(null);
    } catch (err) {
      console.error('Unexpected error fetching worker data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
      
      // Set empty fallback data
      setWorkerData(null);
      setBookings([]);
      setMessages([]);
      setReviews([]);
      setTestimonials([]);
      setNotifications({ messages: 0, bookings: 0, reviews: 0, issues: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await workerService.updateBookingStatus(bookingId, { status: 'accepted' });
      setBookingResponses({ ...bookingResponses, [bookingId]: 'accepted' });
      setWorkerStatus('busy');
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'accepted' } : b));
    } catch (err) {
      console.error('Error accepting booking:', err);
      toast.error('Failed to accept booking');
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    try {
      await workerService.updateBookingStatus(bookingId, { status: 'declined' });
      setBookingResponses({ ...bookingResponses, [bookingId]: 'declined' });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'declined' } : b));
    } catch (err) {
      console.error('Error declining booking:', err);
      toast.error('Failed to decline booking');
    }
  };

  const handleUploadQR = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentQR(URL.createObjectURL(file));
    }
  };

  const handleToggleAvailability = (day) => {
    setScheduleAvailability({ ...scheduleAvailability, [day]: !scheduleAvailability[day] });
  };

  const handleUpdateSchedule = async () => {
    try {
      await workerService.updateWorkerProfile({
        scheduleAvailability,
        scheduleTime,
      });
      toast.success('Schedule updated successfully!');
    } catch (err) {
      console.error('Error updating schedule:', err);
      toast.error(err.response?.data?.error || 'Failed to update schedule');
    }
  };

  const handleChatWithClient = (clientName, bookingId) => {
    setSelectedBookingForChat(bookingId);
    setActiveTab('messages');
    setSelectedMessage(bookingId);
  };

  const handleSaveFees = async () => {
    try {
      await workerService.updateWorkerProfile({
        hourlyRate: profileForm.hourlyRate,
        bio: profileForm.bio,
        location: profileForm.location,
        name: profileForm.name,
        phone: profileForm.phone,
        category: profileForm.category,
      });
      await fetchWorkerData();
      toast.success('Hourly rate and profile details saved');
    } catch (err) {
      console.error('Error saving fees:', err);
      toast.error(err.response?.data?.error || 'Failed to save hourly rate');
    }
  };

  const handleSavePaymentDetails = async () => {
    try {
      const payload = {
        bank_name: paymentForm.bankName,
        bank_account_name: paymentForm.accountHolderName,
        bank_account_number: paymentForm.accountNumber,
      };

      if (paymentQR) {
        const file = await (await fetch(paymentQR)).blob();
        const qrFile = new File([file], 'payment-qr.png', { type: file.type || 'image/png' });
        const qrUrl = await uploadFileAndGetUrl(qrFile, `${apiBaseUrl}/uploads/payment-qr`);
        payload.qr_code = qrUrl;
        setPaymentQR(qrUrl);
      }

      await workerService.updateWorkerProfile(payload);
      await fetchWorkerData();
      toast.success('Payment details saved successfully');
    } catch (err) {
      console.error('Error saving payment details:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to save payment details');
    }
  };

  const handleProfileSave = async () => {
    try {
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        location: profileForm.location,
        category: profileForm.category,
        hourlyRate: profileForm.hourlyRate,
        bio: profileForm.bio,
      };

      if (citizenshipDocument) {
        payload.verification_document = citizenshipDocument;
      }

      await workerService.updateWorkerProfile(payload);
      await fetchWorkerData();
      toast.success('Profile saved. Verification stays pending until admin reviews your document.');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(err.response?.data?.error || 'Failed to save profile');
    }
  };

  const handleCitizenshipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFileAndGetUrl(file, `${apiBaseUrl}/uploads/verification-document`);
      setCitizenshipDocument(url);
      await workerService.updateWorkerProfile({ verification_document: url });
      await fetchWorkerData();
      toast.success('Citizenship document uploaded. Admin verification is pending.');
    } catch (err) {
      console.error('Error uploading citizenship document:', err);
      toast.error(err.message || 'Failed to upload citizenship document');
    }
  };

  const parseCategories = () => {
    return serviceCategories
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0);
  };

  const categoriesAsJSON = () => {
    return JSON.stringify(parseCategories());
  };

  const getStatusColor = (status) => {
    const colors = {
      available: { bg: '#d1fae5', text: '#065f46', label: '✓ Available' },
      busy: { bg: '#fef3c7', text: '#92400e', label: '⏱ Busy' },
      completed: { bg: '#dbeafe', text: '#0c2d6d', label: '✓ Completed' },
      'on-leave': { bg: '#ede9fe', text: '#5b21b6', label: 'On Leave' },
    };
    return colors[status] || colors.available;
  };

  // Glow animation styles
  const glowAnimationStyle = `
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 8px currentColor, 0 0 16px currentColor; }
      50% { box-shadow: 0 0 16px currentColor, 0 0 32px currentColor; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.15); }
    }
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .status-dot {
      animation: glow 2s ease-in-out infinite, pulse 3s ease-in-out infinite;
    }
    .notification-badge {
      animation: pulse-ring 2s infinite;
    }
    .no-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;

  return (
    <>
      <style>{glowAnimationStyle}</style>
      <Navbar />
      
      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-neutral-600">Loading dashboard...</p>
        </div>
      )}

      {error && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-bold mb-4">Error loading dashboard</p>
            <p className="text-neutral-600 mb-4">{error}</p>
            <button 
              onClick={fetchWorkerData}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
      <div className="h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
        <div className="flex h-full overflow-hidden">
          {/* Sidebar */}
          <div
            className="w-64 h-full shrink-0 shadow-lg overflow-y-auto no-scrollbar"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-6">
              <h2 className="text-lg font-black text-neutral-800 mb-6">
                <span style={{ color: '#d97706' }}>Worker</span> Dashboard
              </h2>

              {/* Status Display - Modern Glowing Dot */}
              <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(217, 119, 6, 0.05)' }}>
                <div
                  className="status-dot w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background:
                      workerStatus === 'available' ? '#10b981' :
                      workerStatus === 'busy' ? '#f59e0b' :
                      workerStatus === 'completed' ? '#3b82f6' :
                      '#a855f7',
                  }}
                />
                <div>
                  <p className="text-xs text-neutral-600">Status</p>
                  <p className="text-sm font-bold text-neutral-800">
                    {workerStatus === 'available' ? 'Available' :
                     workerStatus === 'busy' ? 'Busy' :
                     workerStatus === 'completed' ? 'Completed' :
                     'On Leave'}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-3 mb-8">
                {[
                  { id: 'overview', label: 'Dashboard', icon: <FaHome />, count: 0 },
                  { id: 'schedule', label: 'My Schedule', icon: <FaCalendar />, count: 0 },
                  { id: 'fees', label: 'My Fees', icon: <FaDollarSign />, count: 0 },
                  { id: 'messages', label: 'Messages', icon: <FaComments />, count: notifications.messages },
                  { id: 'requests', label: 'Booking Requests', icon: <FaClipboardList />, count: notifications.bookings },
                  { id: 'testimonials', label: 'Testimonials', icon: <FaBook />, count: notifications.reviews },
                  { id: 'report-issue', label: 'Report Issue', icon: <FaExclamationTriangle />, count: notifications.issues },
                  { id: 'payment', label: 'Payment Method', icon: <FaQrcode />, count: 0 },
                  { id: 'profile', label: 'My Profile', icon: <FaUser />, count: 0 },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative"
                    style={{
                      background: activeTab === item.id ? '#d97706' : 'transparent',
                      color: activeTab === item.id ? 'white' : '#6b7280',
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.count > 0 && (
                      <div className="absolute right-3 w-3 h-3 rounded-full" style={{ background: '#ef4444', animation: 'pulse-dot 2s infinite' }}></div>
                    )}
                  </button>
                ))}
              </nav>

              {/* Logout */}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 h-full overflow-y-auto no-scrollbar">
            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Welcome Card */}
                  <div
                    className="rounded-2xl overflow-hidden shadow-lg flex items-center justify-between p-8"
                    style={{ background: 'linear-gradient(135deg, #d97706 0%, #966647 100%)' }}
                  >
                    <div className="text-white flex-1">
                      <h1 className="text-3xl font-black mb-2">Welcome, {workerProfile.name}! 👋</h1>
                      <p className="text-sm text-white/90">Manage your bookings and grow your business</p>
                    </div>
                    
                    {/* Worker Avatar - Perfect Circle */}
                    <div className="hidden md:flex items-center justify-center ml-12">
                      <div
                        className="w-48 h-48 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-4 relative"
                        style={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        {resolvedProfileImage && !profileImageError ? (
                          <img
                            src={resolvedProfileImage}
                            alt={workerProfile.name}
                            className="w-full h-full object-cover"
                            onError={() => setProfileImageError(true)}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center text-white font-black text-6xl"
                          style={{ display: resolvedProfileImage && !profileImageError ? 'none' : 'flex', background: 'rgba(0, 0, 0, 0.2)' }}
                        >
                          {workerProfile.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Earnings', value: `Rs. ${Number(workerProfile.totalEarnings || 0).toLocaleString()}`, icon: '💰' },
                      { label: 'Total Bookings', value: workerProfile.totalBookings, icon: '📅' },
                      { label: 'Rating', value: `${workerProfile.averageRating} ⭐`, icon: '⭐' },
                      { label: 'Hourly Rate', value: `Rs. ${workerProfile.hourlyRate}`, icon: '💵' },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 shadow-md">
                        <p className="text-neutral-600 text-xs font-semibold mb-3">{stat.label}</p>
                        <p className="text-xl font-black text-neutral-800">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Pending Requests Alert */}
                  {pendingBookings.filter((b) => !bookingResponses[b.id]).length > 0 && (
                    <div
                      className="rounded-3xl p-6 border-l-4 text-white"
                      style={{ background: '#f97316', borderColor: '#ea580c' }}
                    >
                      <p className="font-bold text-base mb-2">🔔 {pendingBookings.filter((b) => !bookingResponses[b.id]).length} New Booking Request(s)</p>
                      <p className="text-white/90 text-xs">Review and respond to client booking requests to grow your business</p>
                      <button
                        onClick={() => setActiveTab('requests')}
                        className="mt-4 px-6 py-2 rounded-lg font-bold bg-white text-orange-600 hover:shadow-lg transition-all"
                      >
                        Review Requests
                      </button>
                    </div>
                  )}

                  {/* Upcoming Bookings - Modern Table */}
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h2 className="text-lg font-black text-neutral-800 mb-6" style={{ color: '#d97706' }}>Upcoming Bookings</h2>
                    
                    {/* Table Header */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 border-b-2" style={{ borderColor: '#e5e7eb' }}>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Status</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Client / Service</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Date</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Amount</p>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Rating & Actions</p>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="space-y-3 mt-4">
                      {upcomingBookings.length > 0 ? (
                        upcomingBookings.map((booking) => {
                          const statusColors = { completed: { bg: '#d1fae5', dot: '#c30d35', label: 'Pending' } };
                          const statusStyle = statusColors.completed;
                          const bookingClientName = booking.clientName || booking.client_name || booking.client || 'Client';
                          const bookingService = booking.service || booking.service_name || booking.category || 'Service';
                          const bookingDate = booking.dateTime || booking.date || booking.scheduled_at || booking.created_at || 'TBD';
                          const bookingAmount = booking.amount || booking.budget || booking.total_amount || 0;
                          
                          return (
                            <div key={booking.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-neutral-200">
                              {/* Status */}
                              <div className="md:col-span-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full" style={{ background: statusStyle.dot }}></div>
                                  <span className="text-sm font-bold" style={{ color: statusStyle.dot }}>{statusStyle.label}</span>
                                </div>
                              </div>

                              {/* Client / Service */}
                              <div className="md:col-span-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={booking.clientImage || booking.client_image}
                                    alt={bookingClientName}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                    onError={(e) => (e.target.style.display = 'none')}
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-neutral-800 truncate">{bookingClientName}</p>
                                    <p className="text-xs text-neutral-600 truncate">{bookingService}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Date */}
                              <div className="md:col-span-2">
                                <p className="text-sm font-semibold text-neutral-700">{bookingDate}</p>
                              </div>

                              {/* Amount */}
                              <div className="md:col-span-2">
                                <p className="text-sm font-bold text-neutral-800">Rs. {bookingAmount}</p>
                              </div>

                              {/* Rating & Actions */}
                              <div className="md:col-span-3 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  {[...Array(booking.rating || 0)].map((_, i) => (
                                    <FaStar key={i} size={14} style={{ color: '#d97706' }} />
                                  ))}
                                  <span className="text-sm font-bold ml-2">{booking.rating || 0}/5</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button className="p-2 rounded-lg transition-all hover:shadow-md" style={{ background: '#f3f4f6', color: '#6b7280' }} title="View Details">
                                    <FaEye size={14} />
                                  </button>
                                  <button className="p-2 rounded-lg transition-all hover:shadow-md" style={{ background: '#f3f4f6', color: '#6b7280' }} title="More">
                                    <FaEllipsisV size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-neutral-600 text-center py-8">No upcoming bookings. More bookings coming soon!</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h2 className="text-lg font-black text-neutral-800 mb-6">Recent Reviews</h2>
                    <div className="space-y-4">
                      {reviews.length > 0 ? (
                        reviews.slice(0, 5).map((review) => (
                          <div key={review.id} className="p-4 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-bold text-neutral-800">{review.reviewer_name || review.reviewer || 'Client'}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(review.rating || 0)].map((_, i) => (
                                    <FaStar key={i} size={14} style={{ color: '#d97706' }} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-neutral-500">{review.created_at || review.date || ''}</p>
                            </div>
                            <p className="text-neutral-700">{review.comment || review.review || review.text || ''}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-neutral-600 text-center py-8">No reviews yet. Your first review will appear here!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="max-w-2xl">
                  <h1 className="text-2xl font-black text-neutral-800 mb-8">My Schedule</h1>
                  <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <p className="text-neutral-600 text-sm font-semibold mb-6">Check the days you're available. Unchecked days you'll be on leave.</p>
                    <div className="space-y-4 mb-8">
                      {Object.keys(scheduleAvailability).map((day) => (
                        <div key={day} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#f9fafb' }}>
                          <input
                            type="checkbox"
                            checked={scheduleAvailability[day]}
                            onChange={() => handleToggleAvailability(day)}
                            className="w-5 h-5 cursor-pointer"
                            style={{ accentColor: '#d97706' }}
                          />
                          <div className="flex-1">
                            <p className="font-bold text-neutral-800">{day}</p>
                          </div>
                          {scheduleAvailability[day] && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="time"
                                  value={scheduleTime[day].start}
                                  onChange={(e) =>
                                    setScheduleTime({
                                      ...scheduleTime,
                                      [day]: { ...scheduleTime[day], start: e.target.value },
                                    })
                                  }
                                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                                />
                              </div>
                              <span className="text-neutral-600 font-semibold">to</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="time"
                                  value={scheduleTime[day].end}
                                  onChange={(e) =>
                                    setScheduleTime({
                                      ...scheduleTime,
                                      [day]: { ...scheduleTime[day], end: e.target.value },
                                    })
                                  }
                                  className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleUpdateSchedule}
                      className="w-full py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg"
                      style={{ background: '#d97706' }}
                    >
                      Update Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Fees Tab */}
              {activeTab === 'fees' && (
                <div className="max-w-2xl">
                  <h1 className="text-2xl font-black text-neutral-800 mb-8">My Fees</h1>

                  <div className="bg-white rounded-3xl p-8 shadow-lg space-y-6">
                    <div>
                      <label className="block text-neutral-700 text-sm font-semibold mb-3">Hourly Rate (Rs.)</label>
                      <input
                        type="number"
                        value={profileForm.hourlyRate}
                        onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: Number(e.target.value ) })}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm"
                      />
                      <p className="text-xs text-neutral-600 mt-2">This is what clients see when booking your services</p>
                    </div>

                    <div>
                      <label className="block text-neutral-700 text-sm font-semibold mb-3">Service Description</label>
                      <textarea
                        rows="4"
                        placeholder="Describe what clients can expect from your service"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm"
                        defaultValue="Experienced plumber with 8+ years of professional expertise. Reliable, trustworthy, and committed to quality work."
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-700 text-sm font-semibold mb-3">Service Categories</label>
                      <textarea
                        rows="2"
                        placeholder="Add multiple categories separated by commas (,). Example: Pipe Repair, Installation, Maintenance"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm"
                        value={serviceCategories}
                        onChange={(e) => setServiceCategories(e.target.value)}
                      />
                      <p className="text-xs text-neutral-600 mt-2">Separate multiple categories with , (comma character)</p>
                      
                      {/* Display categories as JSON */}
                      {/* <div className="mt-4 p-4 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                        <p className="text-xs text-neutral-600 font-semibold mb-2">Stored as JSON:</p>
                        <div className="bg-white p-3 rounded-lg text-xs font-mono overflow-x-auto" style={{ color: '#1f2937' }}>
                          {categoriesAsJSON()}
                        </div>
                      </div> */}

                      {/* Display parsed categories as tags */}
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-neutral-600 font-semibold">Your Categories:</p>
                        <div className="flex flex-wrap gap-2">
                          {parseCategories().map((category, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                              style={{ background: '#d97706' }}
                            >
                              {category}
                            </div>
                          ))}
                          {parseCategories().length === 0 && (
                            <p className="text-xs text-neutral-500 italic">No categories added yet</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveFees}
                      className="w-full py-3 rounded-xl font-bold text-white"
                      style={{ background: '#d97706' }}
                    >
                      Save Fees
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div className="h-full flex gap-4">
                  {/* Messages List - Sidebar */}
                  <div className="w-80">
                    <h1 className="text-2xl font-black text-neutral-800 mb-8">Messages</h1>
                    <div className="space-y-3">
                      {messagesList.map((msg) => {
                        const messageTitle = msg.clientName || msg.client_name || msg.other_user_name || msg.name || 'Client';
                        const messagePreview = msg.lastMessage || msg.last_message || msg.last_message_text || 'New message';
                        const messageTime = msg.timestamp || msg.updated_at || msg.created_at || '';
                        const isUnread = msg.unread || msg.unread_count > 0;

                        return (
                        <button
                          key={msg.id}
                          onClick={() => setSelectedMessage(msg.id)}
                          className="w-full text-left p-4 rounded-xl transition-all border-l-4"
                          style={{
                            background: selectedMessage === msg.id ? 'rgba(217, 119, 6, 0.1)' : '#f9fafb',
                            borderColor: selectedMessage === msg.id ? '#d97706' : '#e5e7eb',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-neutral-800">{messageTitle}</h4>
                              <p className="text-xs text-neutral-600 truncate">{messagePreview}</p>
                              <p className="text-xs text-neutral-500 mt-1">{messageTime}</p>
                            </div>
                            {isUnread && <div className="w-2 h-2 rounded-full" style={{ background: '#d97706' }}></div>}
                          </div>
                        </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chat Window - Middle */}
                  <div className="flex-1 bg-white rounded-3xl p-8 shadow-lg flex flex-col">
                    {selectedMessageData ? (
                      <>
                        <div className="pb-6 border-b border-neutral-200 mb-6 flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-base text-neutral-800">
                              {selectedMessageData.clientName || selectedMessageData.client_name || selectedMessageData.other_user_name || 'Client'}
                            </h3>
                            <p className="text-xs text-neutral-600">Active now</p>
                          </div>
                          
                          {/* Accept/Decline Buttons */}
                          <div className="flex items-center gap-2">
                            {bookingResponses[selectedMessage] !== 'accepted' ? (
                              <>
                                <button
                                  onClick={() => handleAcceptBooking(selectedMessage)}
                                  className="px-4 py-2 rounded-lg font-bold text-sm text-white transition-all hover:shadow-md flex items-center gap-2"
                                  style={{ background: '#10b981' }}
                                  title="Accept booking"
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  onClick={() => handleDeclineBooking(selectedMessage)}
                                  className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:shadow-md flex items-center gap-2"
                                  style={{ background: '#fee2e2', color: '#ef4444' }}
                                  title="Decline booking"
                                >
                                  ✕ Decline
                                </button>
                              </>
                            ) : (
                              <div className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: '#d1fae5', color: '#065f46' }}>
                                ✓ Accepted
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 mb-6 space-y-4 overflow-y-auto no-scrollbar">
                          <div className="flex justify-start">
                            <div className="max-w-xs bg-gray-100 rounded-2xl p-4 text-neutral-800 text-sm">
                              Hi Raj, can you help with my plumbing issue?
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <div className="max-w-xs rounded-2xl p-4 text-white text-sm" style={{ background: '#d97706' }}>
                              Of course! I can come tomorrow. What's the issue?
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-xl outline-none text-sm"
                            onFocus={(e) => (e.target.style.borderColor = '#d97706')}
                            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                          />
                          <button className="p-3 rounded-full text-white transition-all hover:shadow-lg hover:scale-110" style={{ background: '#d97706' }} title="Send message">
                            <FaPaperPlane size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <FaComments size={48} className="mx-auto mb-4" style={{ color: '#d97706', opacity: 0.5 }} />
                          <p className="text-neutral-600 text-sm font-semibold">Select a message to start chatting</p>
                        </div>
                      </div>
                    )}
                  </div>


                </div>
              )}

              {/* Booking Requests Tab */}
              {activeTab === 'requests' && (
                <div>
                  <h1 className="text-2xl font-black text-neutral-800 mb-8">Booking Requests</h1>
                  <div className="space-y-6">
                    {pendingBookings.map((request) => {
                      const response = bookingResponses[request.id];
                      if (response === 'declined') return null;

                      const requestClientName = request.clientName || request.client_name || request.client || 'Client';
                      const requestService = request.service || request.service_name || request.category || 'Service';
                      const requestDateTime = request.dateTime || request.date || request.scheduled_at || request.created_at || 'TBD';
                      const requestDuration = request.duration || request.duration_hours || 0;
                      const requestBudget = request.budget || request.amount || request.total_amount || 0;
                      const requestLocation = request.location || request.address || 'N/A';
                      const requestDescription = request.description || request.notes || '';
                      const requestRating = request.clientRating || request.client_rating || 0;

                      return (
                        <div key={request.id} className="bg-white rounded-3xl p-8 shadow-lg">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-200">
                            <div className="flex items-center gap-4">
                              <img
                                src={request.clientImage || request.client_image}
                                alt={requestClientName}
                                className="w-16 h-16 rounded-full object-cover"
                                onError={(e) => (e.target.style.display = 'none')}
                              />
                              <div>
                                <h3 className="text-lg font-black text-neutral-800">{requestClientName}</h3>
                                <div className="flex items-center gap-1 text-neutral-600">
                                  <FaStar size={14} style={{ color: '#d97706' }} />
                                  <span className="text-xs font-semibold">{requestRating} Rating</span>
                                </div>
                              </div>
                            </div>
                            {response === 'accepted' && (
                              <div className="px-4 py-2 rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>
                                <p className="font-bold text-xs">✓ Accepted</p>
                              </div>
                            )}
                          </div>

                          {/* Booking Details - Compact Layout */}
                          <div className="flex items-start gap-6 mb-4">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-neutral-600 text-xs font-semibold">Service</p>
                                <p className="text-sm font-bold text-neutral-800 mt-1">{requestService}</p>
                              </div>
                              <div>
                                <p className="text-neutral-600 text-xs font-semibold">Date</p>
                                <p className="text-sm font-bold text-neutral-800 mt-1">{requestDateTime}</p>
                              </div>
                              <div>
                                <p className="text-neutral-600 text-xs font-semibold">Duration</p>
                                <p className="text-sm font-bold text-neutral-800 mt-1">{requestDuration}h</p>
                              </div>
                              <div>
                                <p className="text-neutral-600 text-xs font-semibold">Budget</p>
                                <p className="text-sm font-bold" style={{ color: '#d97706' }}>Rs. {requestBudget}</p>
                              </div>
                            </div>
                          </div>

                          {/* Location & Description */}
                          <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                              <FaMapMarkerAlt size={14} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
                              <p className="text-neutral-700">{requestLocation}</p>
                            </div>
                            <p className="text-neutral-600 leading-relaxed">{requestDescription}</p>
                          </div>

                          {/* Action Icons */}
                          <div className="flex items-center justify-between mt-4">
                            <div>
                              {response === 'accepted' && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#d1fae5', color: '#065f46' }}>
                                  <span>✓</span>
                                  <span>Accepted</span>
                                </div>
                              )}
                            </div>
                            {response !== 'accepted' && (
                              <div className="flex gap-4">
                                <button
                                  onClick={() => handleChatWithClient(request.clientName, request.id)}
                                  className="p-2 rounded-lg transition-all hover:bg-blue-100"
                                  title="Chat with client"
                                  style={{ color: '#3b82f6' }}
                                >
                                  <FaComments size={18} />
                                </button>
                                <button
                                  onClick={() => handleAcceptBooking(request.id)}
                                  className="p-2 rounded-lg transition-all hover:bg-green-100"
                                  title="Accept booking"
                                  style={{ color: '#10b981' }}
                                >
                                  <FaCheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeclineBooking(request.id)}
                                  className="p-2 rounded-lg transition-all hover:bg-red-100"
                                  title="Decline booking"
                                  style={{ color: '#ef4444' }}
                                >
                                  <FaTimesCircle size={18} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {pendingBookings.every((b) => bookingResponses[b.id]) && (
                      <div className="text-center py-12">
                        <p className="text-neutral-600 text-sm font-semibold">No pending booking requests</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method Tab */}
              {activeTab === 'payment' && (
                <div className="max-w-2xl">
                  <h1 className="text-2xl font-black text-neutral-800 mb-8">Payment Method</h1>

                  <div className="bg-white rounded-3xl p-8 shadow-lg space-y-8">
                    {/* QR Code Upload */}
                    <div>
                      <h3 className="text-lg font-black text-neutral-800 mb-6">Your Payment QR Code</h3>

                      {resolvedPaymentQR ? (
                        <div className="flex flex-col items-center gap-6">
                          <div className="p-4 rounded-2xl" style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}>
                            <img src={resolvedPaymentQR} alt="Payment QR" className="w-48 h-48 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
                          </div>
                          <button
                            onClick={() => setPaymentQR(null)}
                            className="px-6 py-3 rounded-xl font-bold border-2"
                            style={{ borderColor: '#d97706', color: '#d97706' }}
                          >
                            Change QR Code
                          </button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
                          style={{ borderColor: '#e5e7eb' }}
                        >
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadQR}
                              className="hidden"
                            />
                            <FaCamera size={48} className="mx-auto mb-4" style={{ color: '#d97706' }} />
                            <p className="text-neutral-800 font-bold mb-2">Upload Payment QR Code</p>
                            <p className="text-neutral-600 text-xs">Click to upload or drag and drop</p>
                            <p className="text-neutral-500 text-xs mt-2">PNG, JPG up to 5MB</p>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Payment Info */}
                    <div className="p-4 rounded-xl" style={{ background: '#fef3c7', borderLeft: '4px solid #d97706' }}>
                      <p className="font-bold text-amber-900 text-sm mb-2">💡 Payment Info</p>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>• Upload a clear QR code from your payment app (Esewa, IME Pay, etc.)</li>
                        <li>• Make sure the QR code is legible and not blurry</li>
                        <li>• Clients will use this QR to pay you after work completion</li>
                      </ul>
                    </div>

                    {/* Bank Account (Optional) */}
                    <div>
                      <h4 className="text-base font-bold text-neutral-800 mb-4">Optional: Bank Account Details</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-neutral-700 text-sm font-semibold mb-2">Bank Name</label>
                          <input
                            type="text"
                            placeholder="e.g., Nepal Bank Limited"
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm"
                            value={paymentForm.bankName}
                            onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-700 text-sm font-semibold mb-2">Account Holder Name</label>
                          <input
                            type="text"
                            placeholder="Your full name"
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm"
                            value={paymentForm.accountHolderName}
                            onChange={(e) => setPaymentForm({ ...paymentForm, accountHolderName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-700 text-sm font-semibold mb-2">Account Number</label>
                          <input
                            type="text"
                            placeholder="Your account number"
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm"
                            value={paymentForm.accountNumber}
                            onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSavePaymentDetails}
                      className="w-full py-3 rounded-xl font-bold text-white"
                      style={{ background: '#d97706' }}
                    >
                      Save Payment Details
                    </button>
                  </div>
                </div>
              )}

              {/* Testimonials Tab */}
              {activeTab === 'testimonials' && (
                <div className="max-w-4xl">
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-neutral-800">My Experience with Sallah Sanjal</h1>
                    <button
                      onClick={() => setAddTestimonialOpen(!addTestimonialOpen)}
                      className="p-3 rounded-full text-white transition-all hover:shadow-lg hover:scale-110"
                      style={{ background: '#d97706' }}
                      title="Add new testimonial"
                    >
                      <FaPlus size={20} />
                    </button>
                  </div>

                  {/* Add Testimonial Form */}
                  {addTestimonialOpen && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 border-l-4" style={{ borderColor: '#d97706' }}>
                      <h2 className="text-2xl font-black text-neutral-800 mb-6">Share Your Experience</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-neutral-700 font-semibold mb-2">Title</label>
                          <input
                            type="text"
                            value={newTestimonial.title}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, title: e.target.value })}
                            placeholder="e.g., Great Experience"
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-700 font-semibold mb-2">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setNewTestimonial({ ...newTestimonial, rating: star })}
                                className="text-3xl transition-all hover:scale-125"
                                style={{ color: star <= newTestimonial.rating ? '#d97706' : '#d1d5db' }}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-neutral-700 font-semibold mb-2">Your Feedback</label>
                          <textarea
                            value={newTestimonial.text}
                            onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                            placeholder="Tell us about your experience..."
                            rows="5"
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl outline-none focus:border-orange-500 resize-none"
                          />
                        </div>
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => setAddTestimonialOpen(false)}
                            className="px-6 py-3 rounded-xl font-bold transition-all"
                            style={{ background: '#f3f4f6', color: '#6b7280' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              if (newTestimonial.title.trim() && newTestimonial.text.trim()) {
                                try {
                                  const response = await workerService.createTestimonial({
                                    title: newTestimonial.title,
                                    content: newTestimonial.text,
                                    rating: newTestimonial.rating,
                                  });
                                  
                                  // Fetch updated testimonials list
                                  const testimonialsRes = await workerService.getWorkerTestimonials();
                                  setTestimonials(testimonialsRes.data?.data || testimonialsRes.data || []);
                                  
                                  setNewTestimonial({ title: '', rating: 5, text: '' });
                                  setAddTestimonialOpen(false);
                                  toast.success('Testimonial submitted successfully!');
                                } catch (error) {
                                  console.error('Error creating testimonial:', error);
                                  toast.error('Failed to submit testimonial. Please try again.');
                                }
                              }
                            }}
                            className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg"
                            style={{ background: '#d97706' }}
                          >
                            <FaCheck className="inline mr-2" /> Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((review) => (
                      <div key={review.id} className="bg-white rounded-2xl p-6 shadow-md border-l-4" style={{ borderColor: '#d97706' }}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold text-neutral-900">{review.title}</p>
                            <p className="text-xs text-neutral-600">My feedback on Sallah Sanjal</p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <FaStar key={i} size={14} style={{ color: '#d97706' }} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-neutral-700">{review.content || review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Issue Tab */}
              {activeTab === 'report-issue' && (
                <div className="max-w-6xl">
                  <h1 className="text-4xl font-black text-neutral-800 mb-8">Report an Issue</h1>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Left Side - Quick Info & Type Selection */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                      <h2 className="text-2xl font-black text-neutral-800 mb-6">Issue Type</h2>
                      <div className="space-y-4">
                        {['complaint', 'payment-issue', 'bug-report'].map((type) => {
                          const typeInfo = {
                            complaint: { title: 'Complaint', desc: 'Report poor behavior or service' },
                            'payment-issue': { title: 'Payment Issue', desc: 'Report payment problems' },
                            'bug-report': { title: 'Bug Report', desc: 'Report technical issues' }
                          };
                          const info = typeInfo[type];
                          return (
                            <button
                              key={type}
                              onClick={() => setIssueForm({ ...issueForm, type })}
                              className="w-full p-4 rounded-xl transition-all text-left"
                              style={{
                                background: issueForm.type === type ? '#d97706' : '#f3f4f6',
                                border: issueForm.type === type ? '2px solid #d97706' : '2px solid #e5e7eb',
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-bold" style={{ color: issueForm.type === type ? 'white' : '#1f2937' }}>{info.title}</p>
                                  <p className="text-xs" style={{ color: issueForm.type === type ? 'rgba(255,255,255,0.8)' : '#6b7280' }}>{info.desc}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-neutral-800 mb-6">Describe Your Issue</h2>
                        <textarea
                          value={issueForm.description}
                          onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                          className="w-full p-4 border-2 border-neutral-200 rounded-xl outline-none focus:border-orange-500 resize-none mb-6"
                          rows="6"
                          placeholder="Tell us what happened..."
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={() => {
                          if (issueForm.description.trim()) {
                            setSubmittedIssues([...submittedIssues, {
                              id: submittedIssues.length + 1,
                              type: issueForm.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                              description: issueForm.description,
                              date: new Date().toISOString().split('T')[0],
                              status: 'pending'
                            }]);
                            setIssueForm({ type: 'complaint', description: '', attachments: '' });
                            toast.success('Issue reported successfully! Our team will review it.');
                          }
                        }}
                        className="w-full py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg"
                        style={{ background: '#d97706' }}
                      >
                        <FaCheck size={16} className="inline mr-2" /> Submit
                      </button>
                    </div>
                  </div>

                  {/* Submitted Issues */}
                  <div>
                    <h2 className="text-2xl font-black text-neutral-800 mb-6">Your Issue Reports</h2>
                    <div className="space-y-4">
                      {submittedIssues.map((issue) => (
                        <div key={issue.id} className="bg-white rounded-2xl p-6 shadow-md border-l-4" style={{ borderColor: '#d97706' }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>
                                  {issue.type}
                                </span>
                              </div>
                              <p className="text-neutral-700 mb-2">{issue.description}</p>
                              <p className="text-xs text-neutral-600">{issue.date}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {issue.status === 'pending' && (
                                <div className="text-center">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#fbbf24' }}>
                                    <FaClock size={14} style={{ color: 'white' }} />
                                  </div>
                                </div>
                              )}
                              {issue.status === 'resolved' && (
                                <div className="text-center">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#10b981' }}>
                                    <FaCheck size={14} style={{ color: 'white' }} />
                                  </div>
                                </div>
                              )}
                              {issue.status === 'acknowledged' && (
                                <div className="text-center">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#3b82f6' }}>
                                    <FaEdit size={14} style={{ color: 'white' }} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h1 className="text-2xl font-black text-neutral-800 mb-8">My Profile</h1>

                  {/* Verification Status Banner */}
                  <div className="mb-8 p-4 rounded-2xl border-l-4" style={{
                    background: profileVerified ? '#d1fae5' : '#fef3c7',
                    borderColor: profileVerified ? '#10b981' : '#d97706'
                  }}>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: '24px' }}>{profileVerified ? '✓' : '⚠️'}</span>
                      <div>
                        <p className="font-bold" style={{ color: profileVerified ? '#065f46' : '#92400e' }}>
                          {profileVerified ? 'Profile Verified ✓' : 'Profile Pending Verification'}
                        </p>
                        <p className="text-xs" style={{ color: profileVerified ? '#047857' : '#b45309' }}>
                          {profileVerified ? 'Your profile is complete and verified.' : 'Complete your profile including citizenship document to get verified.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Content - 2 Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Form (2/3 width) */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-3xl p-8 shadow-lg space-y-8">
                    {/* Profile Header with Avatar and Name */}
                    <div className="flex items-center gap-6 pb-8 border-b border-neutral-200">
                      <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-neutral-200 flex-shrink-0">
                        {resolvedProfileImage && !profileImageError ? (
                          <img
                            src={resolvedProfileImage}
                            alt={workerProfile.name}
                            className="w-full h-full object-cover"
                            onError={() => setProfileImageError(true)}
                          />
                        ) : (
                          <span className="text-3xl font-black text-neutral-600">
                            {workerProfile.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-neutral-800">{profileForm.name}</h2>
                        <div className="flex items-center gap-4 mt-2 text-neutral-600 text-sm">
                          <span className="flex items-center gap-1">
                            <FaStar style={{ color: '#d97706' }} /> {workerProfile.averageRating} Rating
                          </span>
                          <span>{workerProfile.totalReviews} reviews</span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Form - Edit All Details */}
                    <div className="space-y-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-neutral-700 text-sm font-semibold mb-3">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                        />
                      </div>

                      {/* Email and Phone */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-neutral-700 text-sm font-semibold mb-3">Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-700 text-sm font-semibold mb-3">Phone Number</label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* Location and Category */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-neutral-700 text-sm font-semibold mb-3">Location</label>
                          <input
                            type="text"
                            value={profileForm.location}
                            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-700 text-sm font-semibold mb-3">Service Category</label>
                          <select
                            value={profileForm.category}
                            onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                          >
                            <option>Plumbing</option>
                            <option>Electrical</option>
                            <option>Carpentry</option>
                            <option>Cleaning</option>
                            <option>Painting</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Hourly Rate */}
                      <div>
                        <label className="block text-neutral-700 text-sm font-semibold mb-3">Hourly Rate (Rs.)</label>
                        <input
                          type="number"
                          value={profileForm.hourlyRate}
                          onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-neutral-700 text-sm font-semibold mb-3">Professional Bio</label>
                      <textarea
                        rows="4"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none resize-none"
                      />
                    </div>

                    {/* Profile Picture Upload */}
                    <div className="border-t-2 border-neutral-200 pt-8">
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-neutral-800 mb-2">Profile Picture</h3>
                        <p className="text-xs text-neutral-600 mb-4">Upload a professional profile picture. This helps clients identify you.</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsImageModalOpen(true)}
                        className="w-full py-3 border-2 border-dashed rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:border-orange-600 hover:bg-orange-50"
                        style={{ borderColor: resolvedProfileImage ? '#d97706' : '#e5e7eb' }}
                      >
                        <FaCamera size={18} style={{ color: resolvedProfileImage ? '#d97706' : '#9ca3af' }} />
                        <span style={{ color: resolvedProfileImage ? '#d97706' : '#6b7280' }} className="font-semibold">
                          {resolvedProfileImage ? 'Change Profile Picture' : 'Upload Profile Picture'}
                        </span>
                      </button>
                    </div>

                    {/* Citizenship Document Upload - Required for Verification */}
                    <div className="border-t-2 border-neutral-200 pt-8">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-bold text-neutral-800">Citizenship Document</h3>
                          <span className="px-2 py-1 rounded text-xs font-bold" style={{ background: '#fee2e2', color: '#dc2626' }}>Required</span>
                        </div>
                        <p className="text-xs text-neutral-600 mb-4">Upload a clear photo or scan of your citizenship card/document. This is required for profile verification.</p>
                      </div>

                      {citizenshipDocument ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 rounded-2xl" style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}>
                            {isPdfUrl(resolvedCitizenshipDocument) ? (
                              <div className="w-full h-48 flex flex-col items-center justify-center text-center px-4">
                                <FaBook size={44} style={{ color: '#d97706' }} />
                                <p className="mt-3 text-sm font-bold text-neutral-800">PDF document uploaded</p>
                                <p className="text-xs text-neutral-600 break-all">{getFileNameFromUrl(resolvedCitizenshipDocument)}</p>
                                <a
                                  href={resolvedCitizenshipDocument}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-3 text-sm font-bold"
                                  style={{ color: '#d97706' }}
                                >
                                  Open document
                                </a>
                              </div>
                            ) : (
                              <img
                                src={resolvedCitizenshipDocument}
                                alt="Citizenship Document"
                                className="max-w-full h-48 object-contain rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          <div className="flex gap-3 w-full">
                            <button
                              onClick={() => setCitizenshipDocument(null)}
                              className="flex-1 px-4 py-3 rounded-xl font-bold border-2 transition-all"
                              style={{ borderColor: '#d97706', color: '#d97706' }}
                            >
                              Change Document
                            </button>
                            <div className="flex-1 px-4 py-3 rounded-xl font-bold text-center" style={{ background: '#fef3c7', color: '#92400e' }}>
                              Pending Admin Verification
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
                          style={{ borderColor: '#e5e7eb' }}
                        >
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleCitizenshipUpload}
                              className="hidden"
                            />
                            <FaCamera size={48} className="mx-auto mb-4" style={{ color: '#d97706' }} />
                            <p className="text-neutral-800 font-bold mb-2">Upload Citizenship Document</p>
                            <p className="text-neutral-600 text-xs">Click to upload or drag and drop</p>
                            <p className="text-neutral-500 text-xs mt-2">PNG, JPG, PDF up to 10MB</p>
                          </label>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleProfileSave}
                      className="w-full py-3 rounded-xl font-bold text-white transition-all"
                      style={{
                        background: '#d97706',
                        cursor: 'pointer',
                        opacity: 1
                      }}
                    >
                      Save Profile
                    </button>
                      </div>
                    </div>

                    {/* Right Column - Profile Completion Checklist (1/3 width) */}
                    <div className="lg:col-span-1">
                      {/* Completion Progress */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-20">
                        <h3 className="text-lg font-black text-neutral-800 mb-6">Profile Completion</h3>
                        
                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-neutral-600">Progress</p>
                            <p className="text-sm font-black" style={{ color: '#d97706' }}>{citizenshipDocument ? '100%' : '85%'}</p>
                          </div>
                          <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-300" 
                              style={{ width: citizenshipDocument ? '100%' : '85%', background: '#d97706' }}
                            />
                          </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-3">
                          {[
                            { label: 'Full Name', completed: !!profileForm.name, icon: 'ℹ️' },
                            { label: 'Email Address', completed: !!profileForm.email, icon: '✉️' },
                            { label: 'Phone Number', completed: !!profileForm.phone, icon: '📱' },
                            { label: 'Location', completed: !!profileForm.location, icon: '📍' },
                            { label: 'Service Category', completed: !!profileForm.category, icon: '🔧' },
                            { label: 'Hourly Rate', completed: !!profileForm.hourlyRate, icon: '💰' },
                            { label: 'Professional Bio', completed: profileForm.bio.length > 20, icon: '📝' },
                            { label: 'Citizenship Document', completed: !!citizenshipDocument, icon: '📄' },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#f9fafb' }}>
                              <span className="text-lg">{item.icon}</span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-neutral-800">{item.label}</p>
                              </div>
                              {item.completed ? (
                                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10b981' }}>
                                  <FaCheck size={12} color="white" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full" style={{ background: '#e5e7eb' }} />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Verification Badge */}
                        <div className="mt-6 p-4 rounded-xl border-2" style={{ borderColor: profileVerified ? '#10b981' : '#fbbf24', background: profileVerified ? '#f0fdf4' : '#fefce8' }}>
                          <p className="text-sm font-black text-center" style={{ color: profileVerified ? '#15803d' : '#92400e' }}>
                            {profileVerified ? '🎉 Profile Verified!' : '⏳ Pending Verification'}
                          </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-6 space-y-3">
                          <div className="p-3 rounded-lg" style={{ background: '#f3f4f6' }}>
                            <p className="text-xs text-neutral-600 font-semibold">Total Earnings</p>
                            <p className="text-xl font-black text-neutral-800">Rs. {Number(workerProfile.totalEarnings || 0).toLocaleString()}</p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ background: '#f3f4f6' }}>
                            <p className="text-xs text-neutral-600 font-semibold">Total Bookings</p>
                            <p className="text-xl font-black text-neutral-800">{workerProfile.totalBookings}</p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ background: '#f3f4f6' }}>
                            <p className="text-xs text-neutral-600 font-semibold">Member Since</p>
                            <p className="text-sm font-black text-neutral-800">{workerProfile.joinDate || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              </div>
            </div>
          </div>
        </div>
      )}
        {floatingChatOpen && (
          <div
            className="rounded-2xl shadow-2xl flex flex-col"
            style={{
              width: '360px',
              height: '500px',
              background: 'white',
              border: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Chat Header */}
            <div
              className="p-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #966647 100%)', color: 'white' }}
            >
              <h3 className="font-bold text-sm">Messages</h3>
              <button
                onClick={() => setFloatingChatOpen(false)}
                className="bg-white/20 hover:bg-white/30 transition-all rounded-full w-6 h-6 flex items-center justify-center text-white font-bold"
              >
                ×
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto border-b border-neutral-200 no-scrollbar">
              {messagesList.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg.id);
                    setActiveTab('messages');
                    setFloatingChatOpen(false);
                  }}
                  className="w-full text-left p-3 hover:bg-neutral-50 border-b border-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#d97706', color: 'white' }}>
                      {(msg.clientName || msg.client_name || msg.other_user_name || 'C').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-neutral-800">{msg.clientName || msg.client_name || msg.other_user_name || 'Client'}</p>
                      <p className="text-xs text-neutral-600 truncate">{msg.lastMessage || msg.last_message || msg.last_message_text || 'New message'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-neutral-200 flex gap-2">
              <input
                type="text"
                value={floatingChatMessage}
                onChange={(e) => setFloatingChatMessage(e.target.value)}
                placeholder="Type message..."
                className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-xs outline-none focus:border-orange-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && floatingChatMessage.trim()) {
                    setFloatingChatMessage('');
                  }
                }}
              />
              <button
                className="p-2 rounded-full text-white transition-all hover:shadow-lg hover:scale-110"
                style={{ background: '#d97706' }}
                onClick={() => floatingChatMessage.trim() && setFloatingChatMessage('')}
                title="Send message"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSuccess={async (imageUrl) => {
          try {
            await workerService.updateWorkerProfile({ image: imageUrl, profile_image: imageUrl });
            setWorkerData((prev) => ({ ...(prev || {}), image: imageUrl, profile_image: imageUrl }));
          } catch (error) {
            console.error('Failed to update profile image:', error);
          } finally {
            setIsImageModalOpen(false);
          }
        }}
        title="Upload Profile Picture"
        currentImage={workerdata?.profile_image}
        uploadEndpoint={uploadEndpoint}
        authToken={accessToken}
      />
    </>
      
 
      )
      };
    
    export default WorkerDashboard;

      


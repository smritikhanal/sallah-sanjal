import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ImageUploadModal from '../components/ImageUploadModal';
import { FaHome, FaComments, FaCalendar, FaLock, FaCog, FaSignOutAlt, FaChevronRight, FaStar, FaMapMarkerAlt, FaClock, FaSearch, FaBook, FaExclamationTriangle, FaCheck, FaTimes, FaEdit, FaEye, FaPhone, FaEllipsisV, FaPlus, FaCamera, FaPaperPlane } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../utils/store';
import { clientService, workerService, bookingService, chatService } from '../services/endpoints';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, user, accessToken } = useAuthStore();
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const uploadEndpoint = `${apiBaseUrl}/uploads/profile-image`;
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [selectedChat, setSelectedChat] = useState(null);
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
  const [floatingChatMessage, setFloatingChatMessage] = useState('');
  const [chatInputMessage, setChatInputMessage] = useState('');
  const [issueForm, setIssueForm] = useState({ type: 'complaint', description: '', attachments: '' });
  
  // API Data States
  const [clientData, setClientData] = useState(null);
  const [bookingsData, setBookingsData] = useState([]);
  const [messagesData, setMessagesData] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [submittedIssues, setSubmittedIssues] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  
  // Loading and Error States
  const [loadingClient, setLoadingClient] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [errorClient, setErrorClient] = useState('');
  const [errorBookings, setErrorBookings] = useState('');
  const [errorMessages, setErrorMessages] = useState('');
  const [errorChatMessages, setErrorChatMessages] = useState('');
  
  // UI States
  const [addTestimonialOpen, setAddTestimonialOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ title: '', rating: 5, text: '' });
  
  // Notification state
  const [notifications, setNotifications] = useState({
    messages: 0,
    reviews: 0,
    issues: 0,
    promos: 0,
  });
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const handledChatDeepLinkRef = useRef(false);

  // Image upload modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const clientProfileImage = (() => {
    const url = clientData?.profile_image || clientData?.image || clientData?.avatar || null;
    if (!url) return null;
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    const origin = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
  })();

  const selectedConversation = messagesData.find((conversation) => Number(conversation.id) === Number(selectedChat)) || null;

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }

    const conversationIdParam = searchParams.get('conversationId');
    const workerIdParam = searchParams.get('workerId');

    if (handledChatDeepLinkRef.current) {
      return;
    }

    if (conversationIdParam) {
      handledChatDeepLinkRef.current = true;
      setActiveTab('chat');
      setSelectedChat(Number(conversationIdParam));
      return;
    }

    if (tab === 'chat' && workerIdParam) {
      handledChatDeepLinkRef.current = true;

      const openConversation = async () => {
        try {
          const response = await chatService.getOrCreateConversation({ workerId: workerIdParam });
          const conversationId =
            response.data?.conversationId ||
            response.data?.data?.conversationId ||
            response.data?.id ||
            response.data?.data?.id;

          if (conversationId) {
            setSelectedChat(Number(conversationId));
          }
        } catch (error) {
          console.error('Failed to open worker conversation:', error);
          toast.error(error.response?.data?.error || error.message || 'Failed to open chat');
        }
      };

      openConversation();
    }
  }, [searchParams]);
  
  // Fetch Client Profile
  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        setLoadingClient(true);
        setErrorClient('');
        const response = await clientService.getCurrentClientProfile();
        const data = response.data;
        setClientData(data);
        // Update profile form with fetched data
        setProfileForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
        });
      } catch (error) {
        console.error('Error fetching client profile:', error);
        setErrorClient('Failed to load client profile');
      } finally {
        setLoadingClient(false);
      }
    };
    
    fetchClientProfile();
  }, []);
  
  // Fetch Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        setErrorBookings('');
        const response = await clientService.getClientBookings();
        // Ensure response.data is an array
        console.log('Bookings response:', response);
        const bookings = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setBookingsData(bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setErrorBookings('Failed to load bookings');
        setBookingsData([]);
      } finally {
        setLoadingBookings(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  // Fetch Messages/Conversations
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setErrorMessages('');
        const response = await chatService.getUserConversations();
        // Handle response format from chat endpoint
        const messages = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.conversations || response.data?.data || []);
        setMessagesData(messages);
        // Count unread messages for notifications
        const unreadCount = messages.filter(msg => msg.unread).length;
        setNotifications(prev => ({ ...prev, messages: unreadCount }));
      } catch (error) {
        console.error('Error fetching messages:', error);
        setErrorMessages('Failed to load messages');
        setMessagesData([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, []);
  
  // Fetch Issues
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        // Try to fetch client's issues - adjust endpoint based on backend
        const response = await clientService.getClientBookings(); // Placeholder - adjust based on actual endpoint
        if (response.data && Array.isArray(response.data)) {
          // If issues are nested in bookings, extract them
          // Otherwise adjust this logic based on your API
          setSubmittedIssues([]);
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };
    
    fetchIssues();
  }, []);
  
  // Fetch Testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Try to fetch testimonials - adjust endpoint based on backend
        // This may need a dedicated endpoint that doesn't exist yet
        const response = await clientService.getCurrentClientProfile();
        if (response.data && response.data.testimonials) {
          setTestimonials(response.data.testimonials);
        } else {
          setTestimonials([]); // Initialize empty
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials([]); // Initialize empty on error
      }
    };
    
    fetchTestimonials();
  }, []);
  
  // Fetch Chat Messages for Selected Conversation
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!selectedConversation) {
        setChatMessages([]);
        return;
      }
      
      try {
        setLoadingChatMessages(true);
        setErrorChatMessages('');
        const conversationId = selectedConversation.id;
        if (conversationId) {
          const response = await chatService.getConversationMessages(conversationId);
          const messages = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          setChatMessages(messages);
        }
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        setErrorChatMessages('Failed to load messages');
      } finally {
        setLoadingChatMessages(false);
      }
    };
    
    fetchChatMessages();
  }, [selectedConversation]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    // Validation
    if (!profileForm.name.trim()) {
      setProfileError('Name is required');
      return;
    }
    if (!profileForm.email.trim()) {
      setProfileError('Email is required');
      return;
    }
    if (!profileForm.phone.trim()) {
      setProfileError('Phone number is required');
      return;
    }
    if (!profileForm.location.trim()) {
      setProfileError('Location is required');
      return;
    }

    setProfileLoading(true);
    try {
      await clientService.updateClientProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        location: profileForm.location,
      });
      
      setProfileSuccess('Profile updated successfully! ✓');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error) {
      setProfileError(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (!passwordForm.confirmPassword) {
      setPasswordError('Please confirm your new password');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);
    try {
      // Call API endpoint to change password
      await clientService.updateClientProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setPasswordSuccess('Password changed successfully! ✓');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || error.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInputMessage.trim() || !selectedConversation) return;

    try {
      await chatService.sendMessage(selectedConversation.id, chatInputMessage);
      setChatInputMessage('');
      
      // Refresh messages
      if (selectedConversation.id) {
        const response = await chatService.getConversationMessages(selectedConversation.id);
        const messages = Array.isArray(response.data) ? response.data : (response.data?.messages || []);
        setChatMessages(messages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { bg: '#d1fae5', text: '#065f46', label: 'Completed' },
      'in-progress': { bg: '#fef3c7', text: '#92400e', label: 'In Progress' },
      scheduled: { bg: '#dbeafe', text: '#0c2d6d', label: 'Scheduled' },
      cancelled: { bg: '#fee2e2', text: '#7f1d1d', label: 'Cancelled' },
    };
    return statusMap[status] || statusMap.scheduled;
  };

  // Animation styles
  const animationStyle = `
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.15); }
    }
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .notification-badge {
      animation: pulse-ring 2s infinite;
    }
    /* Hide scrollbar while keeping scroll functionality */
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;

  return (
    <>
      <style>{animationStyle}</style>
      <Navbar />
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <div
            className="w-64 shadow-lg overflow-y-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-black text-neutral-800 mb-8">
                <span style={{ color: '#d97706' }}>Client</span> Dashboard
              </h2>

              {/* Navigation */}
              <nav className="space-y-3 mb-8">
                {[
                  { id: 'overview', label: 'Overview', icon: <FaHome />, count: 0 },
                  { id: 'bookings', label: 'My Bookings', icon: <FaCalendar />, count: 0 },
                  { id: 'chat', label: 'Messages', icon: <FaComments />, count: notifications.messages },
                  { id: 'testimonials', label: 'Testimonials', icon: <FaBook />, count: notifications.reviews },
                  { id: 'report-issue', label: 'Report Issue', icon: <FaExclamationTriangle />, count: notifications.issues },
                  { id: 'settings', label: 'Settings', icon: <FaCog />, count: 0 },
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
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border-2 text-neutral-700 font-semibold"
                style={{ borderColor: '#d97706', color: '#d97706' }}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Welcome Card */}
                  <div
                    className="rounded-3xl p-8 text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #d97706 0%, #966647 100%)' }}
                  >
                    <h1 className="text-4xl font-black mb-2">Welcome back, {clientData?.name || 'Guest'}! 👋</h1>
                    <p className="text-white/90 mb-6">Manage your bookings and connect with professionals</p>
                    <button
                      onClick={() => navigate('/workers')}
                      className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
                      style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                    >
                      <FaSearch /> Find Professionals
                    </button>
                  </div>

                  {/* Error Messages */}
                  {errorClient && (
                    <div className="mb-6 p-4 rounded-lg flex items-start gap-3 border-l-4" style={{ background: '#fee2e2', borderColor: '#dc2626' }}>
                      <span className="text-xl">⚠️</span>
                      <p className="text-red-800 font-semibold">{errorClient}</p>
                    </div>
                  )}
                  {errorBookings && (
                    <div className="mb-6 p-4 rounded-lg flex items-start gap-3 border-l-4" style={{ background: '#fee2e2', borderColor: '#dc2626' }}>
                      <span className="text-xl">⚠️</span>
                      <p className="text-red-800 font-semibold">{errorBookings}</p>
                    </div>
                  )}

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Bookings', value: loadingClient ? '...' : clientData?.totalBookings || 0, icon: '📅' },
                      { label: 'Total Spent', value: loadingClient ? '...' : `Rs. ${(clientData?.totalSpent || 0).toLocaleString()}`, icon: '💰' },
                      { label: 'Rating', value: loadingClient ? '...' : `${clientData?.rating || 0} ⭐`, icon: '⭐' },
                      { label: 'Member Since', value: loadingClient ? '...' : new Date(clientData?.joinDate || new Date()).toLocaleDateString(), icon: '📅' },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 shadow-md">
                        <p className="text-neutral-600 text-sm font-semibold mb-3">{stat.label}</p>
                        <p className="text-3xl font-black text-neutral-800">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity - Modern Table */}
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h2 className="text-lg font-black text-neutral-800 mb-6" style={{ color: '#d97706' }}>Recent Bookings</h2>
                    
                    {/* Table Header */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 border-b-2" style={{ borderColor: '#e5e7eb' }}>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Status</p>
                      </div>
                      <div className="md:col-span-4">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Service</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Date</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Amount</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Actions</p>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="space-y-3 mt-4">
                      {loadingBookings ? (
                        <div className="text-center py-8">
                          <p className="text-neutral-600 font-semibold">Loading bookings...</p>
                        </div>
                      ) : bookingsData.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-neutral-600 font-semibold">No bookings found. Start by booking a service!</p>
                        </div>
                      ) : (
                        bookingsData.slice(0, 3).map((booking) => {
                          const status = getStatusBadge(booking.status);
                          const statusColors = {
                            'completed': { bg: '#d1fae5', dot: '#10b981', label: 'Completed' },
                            'in-progress': { bg: '#fef3c7', dot: '#f59e0b', label: 'In Progress' },
                            'pending': { bg: '#dbeafe', dot: '#3b82f6', label: 'Pending' },
                            'cancelled': { bg: '#fee2e2', dot: '#ef4444', label: 'Cancelled' }
                          };
                          const statusStyle = statusColors[booking.status] || statusColors.pending;
                          
                          return (
                            <div key={booking.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl border border-neutral-200 hover:shadow-md transition-all" style={{ background: '#fafafa' }}>
                              {/* Status */}
                              <div className="md:col-span-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ background: statusStyle.dot }}></div>
                                  <span className="text-xs font-bold text-neutral-700" style={{ color: statusStyle.dot }}>{statusStyle.label}</span>
                                </div>
                              </div>

                              {/* Worker / Service */}
                              <div className="md:col-span-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={booking.worker_image}
                                    alt={booking.worker_name}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    onError={(e) => (e.target.style.display = 'none')}
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-neutral-800 truncate">{booking.worker_name}</p>
                                    <p className="text-xs text-neutral-600 truncate">{booking.worker_category || 'Service'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Date */}
                              <div className="md:col-span-2">
                                <p className="text-sm font-semibold text-neutral-700">{booking.created_at}</p>
                                <p className="text-xs text-neutral-600">{booking.updated_at || 'TBA'}</p>
                              </div>

                              {/* Amount */}
                              <div className="md:col-span-2">
                                <p className="text-sm font-bold text-neutral-800">Rs. {booking.amount || 0}</p>
                              </div>

                              {/* Actions */}
                              <div className="md:col-span-2 flex items-center gap-2 justify-end">
                                <button className="p-2 rounded-lg transition-all hover:shadow-md" style={{ background: '#f3f4f6', color: '#6b7280' }} title="View Details">
                                  <FaEye size={14} />
                                </button>
                                <button className="p2 rounded-lg transition-all hover:shadow-md" style={{ background: '#f3f4f6', color: '#6b7280' }} title="More">
                                  <FaEllipsisV size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="w-full mt-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-white"
                      style={{ background: '#d97706' }}
                    >
                      View All Bookings <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}

              {/* Bookings Tab - Modern Table */}
              {activeTab === 'bookings' && (
                <div>
                  <h1 className="text-4xl font-black text-neutral-800 mb-8">My Bookings</h1>
                  
                  {loadingBookings ? (
                    <div className="text-center py-16">
                      <p className="text-neutral-600 font-semibold text-lg">Loading your bookings...</p>
                    </div>
                  ) : bookingsData.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl">
                      <p className="text-neutral-600 font-semibold text-lg">No bookings found yet</p>
                      <button
                        onClick={() => navigate('/workers')}
                        className="mt-4 px-6 py-3 rounded-xl font-bold text-white transition-all hover:shadow-lg"
                        style={{ background: '#d97706' }}
                      >
                        <FaSearch className="inline mr-2" /> Book a Service
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Table Header */}
                      <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 mb-4 border-b-2 px-6" style={{ borderColor: '#e5e7eb' }}>
                        <div className="md:col-span-2">
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Status</p>
                        </div>
                        <div className="md:col-span-3">
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Service</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Schedule</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Location</p>
                        </div>
                        <div className="md:col-span-1">
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Amount</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Actions</p>
                        </div>
                      </div>

                      {/* Table Body */}
                      <div className="space-y-3">
                        {bookingsData.map((booking) => {
                          const status = getStatusBadge(booking.status);
                          const statusColors = {
                            'completed': { bg: '#d1fae5', dot: '#10b981', label: 'Completed' },
                            'in-progress': { bg: '#fef3c7', dot: '#f59e0b', label: 'In Progress' },
                            'pending': { bg: '#dbeafe', dot: '#3b82f6', label: 'Pending' },
                            'cancelled': { bg: '#fee2e2', dot: '#ef4444', label: 'Cancelled' }
                          };
                          const statusStyle = statusColors[booking.status] || statusColors.pending;
                          
                          return (
                            <div key={booking.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-neutral-200">
                              {/* Status */}
                              <div className="md:col-span-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full" style={{ background: statusStyle.dot }}></div>
                                  <span className="text-sm font-bold" style={{ color: statusStyle.dot }}>{statusStyle.label}</span>
                                </div>
                              </div>

                              {/* Worker / Service */}
                              <div className="md:col-span-3">
                                <div className="flex items-center gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-neutral-800 truncate">{booking.worker_name}</p>
                                    <p className="text-xs text-neutral-600 truncate">{booking.worker_category || 'Service'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Schedule */}
                              <div className="md:col-span-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <FaClock size={14} style={{ color: '#d97706' }} />
                                  <div>
                                    <p className="font-semibold text-neutral-800">{booking.created_at}</p>
                                    <p className="text-xs text-neutral-600">{booking.updated_at || 'TBA'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Location */}
                              <div className="md:col-span-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <FaMapMarkerAlt size={14} style={{ color: '#d97706' }} />
                                  <p className="font-semibold text-neutral-800 truncate">{booking.location || 'N/A'}</p>
                                </div>
                              </div>

                              {/* Amount */}
                              <div className="md:col-span-1">
                                <p className="text-sm font-bold text-neutral-800">Rs. {booking.amount || 0}</p>
                              </div>

                              {/* Actions */}
                              <div className="md:col-span-2 flex items-center gap-2 justify-start md:justify-end flex-wrap">
                                {booking.status === 'completed' && (
                                  <button 
                                    onClick={() => navigate(`/booking/${booking.id}/review`)}
                                    className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all hover:shadow-md" 
                                    style={{ background: '#d97706' }}
                                  >
                                    <FaStar size={12} className="inline mr-1" /> Review
                                  </button>
                                )}
                                {booking.status !== 'completed' && (
                                  <button className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md" style={{ borderColor: '#d97706', color: '#d97706', border: '2px solid' }}>
                                    <FaPhone size={12} className="inline mr-1" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="h-full flex gap-6">
                  {/* Messages List */}
                  <div className="w-96">
                    <h1 className="text-4xl font-black text-neutral-800 mb-8">Messages</h1>
                    {loadingMessages ? (
                      <div className="text-center py-8">
                        <p className="text-neutral-600 font-semibold">Loading messages...</p>
                      </div>
                    ) : messagesData.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-2xl p-6">
                        <p className="text-neutral-600 font-semibold">No conversations yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messagesData.map((msg) => (
                          <button
                            key={msg.id}
                            onClick={() => setSelectedChat(msg.id)}
                            className="w-full text-left p-4 rounded-xl transition-all border-l-4"
                            style={{
                              background: selectedChat === msg.id ? 'rgba(217, 119, 6, 0.1)' : '#f9fafb',
                              borderColor: selectedChat === msg.id ? '#d97706' : '#e5e7eb',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={msg.worker_image}
                                alt={msg.worker_name}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => (e.target.style.display = 'none')}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-neutral-800">{msg.worker_name}</h4>
                                  {msg.unread && <div className="w-2 h-2 rounded-full" style={{ background: '#d97706' }}></div>}
                                </div>
                                <p className="text-xs text-neutral-600 truncate">{msg.last_message}</p>
                                <p className="text-xs text-neutral-500 mt-1">{msg.timestamp}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chat Window */}
                  <div className="flex-1 bg-white rounded-3xl p-8 shadow-lg flex flex-col">
                    {selectedConversation ? (
                      <>
                        <div className="pb-6 border-b border-neutral-200 mb-6">
                          <div className="flex items-center gap-4">
                            <img
                              src={selectedConversation.worker_image}
                              alt={selectedConversation.worker_name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => (e.target.style.display = 'none')}
                            />
                            <div>
                              <h3 className="font-bold text-neutral-800">{selectedConversation.worker_name || 'Unknown'}</h3>
                              <p className="text-sm text-neutral-600">{selectedConversation.worker_category || 'Service Provider'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 mb-6 space-y-4 overflow-y-auto">
                          {loadingChatMessages ? (
                            <div className="text-center text-neutral-600">Loading messages...</div>
                          ) : chatMessages.length === 0 ? (
                            <div className="text-center text-neutral-600">No messages yet. Start the conversation!</div>
                          ) : (
                            chatMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs rounded-2xl p-4 ${
                                    msg.sender_id === user?.id
                                      ? 'text-white'
                                      : 'bg-gray-100 text-neutral-800'
                                  }`}
                                  style={{
                                    background: msg.sender_id === user?.id ? '#d97706' : undefined,
                                  }}
                                >
                                  {msg.message}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Type your message..."
                            value={chatInputMessage}
                            onChange={(e) => setChatInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                            className="flex-1 px-4 py-3 border-2 border-neutral-200 rounded-xl outline-none"
                            style={{ focusBorder: '2px solid #d97706' }}
                            onFocus={(e) => (e.target.style.borderColor = '#d97706')}
                            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                          />
                          <button 
                            onClick={handleSendChatMessage}
                            className="p-3 rounded-full text-white transition-all hover:shadow-lg hover:scale-110" 
                            style={{ background: '#d97706' }} 
                            title="Send message"
                          >
                            <FaPaperPlane size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <FaComments size={48} className="mx-auto mb-4" style={{ color: '#d97706', opacity: 0.5 }} />
                          <p className="text-neutral-600 font-semibold">Select a conversation to start chatting</p>
                        </div>
                      </div>
                    )}
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
                            onClick={() => {
                              if (newTestimonial.title.trim() && newTestimonial.text.trim()) {
                                setTestimonials([...testimonials, {
                                  id: testimonials.length + 1,
                                  title: newTestimonial.title,
                                  rating: newTestimonial.rating,
                                  text: newTestimonial.text
                                }]);
                                setNewTestimonial({ title: '', rating: 5, text: '' });
                                setAddTestimonialOpen(false);
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
                        <p className="text-sm text-neutral-700">{review.text}</p>
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
                        {['complaint', 'dispute', 'bug-report'].map((type) => {
                          const typeInfo = {
                            complaint: { title: 'Complaint', desc: 'Report poor service or behavior' },
                            dispute: {  title: 'Dispute', desc: 'Resolve payment or booking issues' },
                            'bug-report': {  title: 'Bug Report', desc: 'Report technical problems' }
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
                              type: issueForm.type.charAt(0).toUpperCase() + issueForm.type.slice(1),
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
                                  {/* <p className="text-xs font-bold text-neutral-600 mt-1">Pending</p> */}
                                </div>
                              )}
                              {issue.status === 'resolved' && (
                                <div className="text-center">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#10b981' }}>
                                    <FaCheck size={14} style={{ color: 'white' }} />
                                  </div>
                                  {/* <p className="text-xs font-bold text-neutral-600 mt-1">Resolved</p> */}
                                </div>
                              )}
                              {issue.status === 'acknowledged' && (
                                <div className="text-center">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#3b82f6' }}>
                                    {/* <FaEdit size={14} style={{ color: 'white' }} /> */}
                                  </div>
                                  <p className="text-xs font-bold text-neutral-600 mt-1">Acknowledged</p>
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

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Edit Profile, Change Password & Danger Zone */}
                  <div className="lg:col-span-2">
                    {/* Edit Profile Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
                      <h3 className="text-2xl font-black text-neutral-800 mb-8 flex items-center gap-3">
                        <FaEdit style={{ color: '#d97706' }} /> Edit Profile
                      </h3>

                      {/* Success Message */}
                      {profileSuccess && (
                        <div className="mb-6 p-4 rounded-lg" style={{ background: '#d1fae5' }}>
                          <p className="text-green-800 font-semibold">{profileSuccess}</p>
                        </div>
                      )}

                      {/* Error Message */}
                      {profileError && (
                        <div className="mb-6 p-4 rounded-lg flex items-start gap-3 border-l-4" style={{ background: '#fee2e2', borderColor: '#dc2626' }}>
                          <span className="text-xl">⚠️</span>
                          <p className="text-red-800 font-semibold">{profileError}</p>
                        </div>
                      )}

                      <form onSubmit={handleProfileSubmit} className="grid grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div>
                          <label className="block text-neutral-700 font-semibold mb-3">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl outline-none transition-colors"
                            style={{
                              borderColor: profileForm.name ? '#d97706' : '#e5e7eb',
                            }}
                          />
                        </div>

                        {/* Email Field */}
                        <div>
                          <label className="block text-neutral-700 font-semibold mb-3">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl outline-none transition-colors"
                            style={{
                              borderColor: profileForm.email ? '#d97706' : '#e5e7eb',
                            }}
                          />
                        </div>

                        {/* Phone Field */}
                        <div>
                          <label className="block text-neutral-700 font-semibold mb-3">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            placeholder="Enter your phone number"
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl outline-none transition-colors"
                            style={{
                              borderColor: profileForm.phone ? '#d97706' : '#e5e7eb',
                            }}
                          />
                        </div>

                        {/* Location Field */}
                        <div>
                          <label className="block text-neutral-700 font-semibold mb-3">Full Location</label>
                          <input
                            type="text"
                            name="location"
                            value={profileForm.location}
                            onChange={handleProfileChange}
                            placeholder="Enter your location"
                            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl outline-none transition-colors"
                            style={{
                              borderColor: profileForm.location ? '#d97706' : '#e5e7eb',
                            }}
                          />
                        </div>

                        {/* Profile Picture Upload */}
                        <div className="col-span-2">
                          <label className="block text-neutral-700 font-semibold mb-3">Profile Picture</label>
                          <button
                            type="button"
                            onClick={() => setIsImageModalOpen(true)}
                            className="w-full py-3 border-2 border-dashed rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:border-orange-600 hover:bg-orange-50"
                            style={{ borderColor: clientProfileImage ? '#d97706' : '#e5e7eb' }}
                          >
                            <FaCamera size={18} style={{ color: clientProfileImage ? '#d97706' : '#9ca3af' }} />
                            <span style={{ color: clientProfileImage ? '#d97706' : '#6b7280' }} className="font-semibold">
                              {clientProfileImage ? 'Change Profile Picture' : 'Upload Profile Picture'}
                            </span>
                          </button>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={profileLoading}
                          className="col-span-2 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
                          style={{ background: '#d97706', opacity: profileLoading ? 0.7 : 1 }}
                        >
                          {profileLoading ? '⏳ Updating Profile...' : (<><FaCheck size={16} /> Update Profile</>)}
                        </button>
                      </form>
                    </div>

                    {/* Change Password Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h3 className="text-2xl font-black text-neutral-800 mb-8 flex items-center gap-3">
                      <FaLock style={{ color: '#d97706' }} /> Change Password
                    </h3>

                    {/* Success Message */}
                    {passwordSuccess && (
                      <div className="mb-6 p-4 rounded-lg" style={{ background: '#d1fae5' }}>
                        <p className="text-green-800 font-semibold">{passwordSuccess}</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {passwordError && (
                      <div className="mb-6 p-4 rounded-lg flex items-start gap-3 border-l-4" style={{ background: '#fee2e2', borderColor: '#dc2626' }}>
                        <span className="text-xl">⚠️</span>
                        <p className="text-red-800 font-semibold">{passwordError}</p>
                      </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      {/* Current Password */}
                      <div>
                        <label className="block text-neutral-700 font-semibold mb-3">Current Password</label>
                        <div className="relative">
                          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter your current password"
                            className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl outline-none transition-colors"
                            style={{
                              borderColor: passwordForm.currentPassword ? '#d97706' : '#e5e7eb',
                            }}
                          />
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">We need this to verify your identity</p>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-neutral-700 font-semibold mb-3">New Password</label>
                        <div className="relative">
                          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter your new password"
                            className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl outline-none transition-colors"
                            style={{
                              borderColor: passwordForm.newPassword ? '#d97706' : '#e5e7eb',
                            }}
                          />
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">At least 6 characters, must be different from current password</p>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-neutral-700 font-semibold mb-3">Confirm New Password</label>
                        <div className="relative">
                          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm your new password"
                            className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl outline-none transition-colors"
                            style={{
                              borderColor: passwordForm.confirmPassword ? '#d97706' : '#e5e7eb',
                            }}
                          />
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-blue-50 rounded-xl p-4 border-l-4" style={{ borderColor: '#3b82f6' }}>
                        <p className="font-semibold text-blue-900 mb-3">Password Requirements:</p>
                        <ul className="space-y-2 text-sm text-blue-800">
                          <li className="flex items-center gap-2">
                            {passwordForm.newPassword.length >= 6 ? '✓' : '○'} At least 6 characters
                          </li>
                          <li className="flex items-center gap-2">
                            {passwordForm.newPassword && passwordForm.newPassword !== passwordForm.currentPassword ? '✓' : '○'} Different from current password
                          </li>
                          <li className="flex items-center gap-2">
                            {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword ? '✓' : '○'} Passwords match
                          </li>
                        </ul>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                        style={{ background: '#d97706', opacity: passwordLoading ? 0.7 : 1 }}
                      >
                        {passwordLoading ? '⏳ Updating Password...' : 'Update Password'}
                      </button>
                    </form>
                  </div>


                    {/* Danger Zone */}
                    <div className="bg-red-50 rounded-3xl p-8 shadow-lg mt-8 border-2 border-red-200">
                      <h3 className="text-xl font-black text-red-800 mb-6">Danger Zone</h3>
                      <div className="space-y-3">
                        <button className="w-full py-3 rounded-xl font-bold border-2 text-red-800" style={{ borderColor: '#dc2626', background: '#fee2e2' }}>
                          🗑️ Delete Account
                        </button>
                        <p className="text-xs text-red-700">⚠️ This action cannot be undone. All your data will be permanently deleted.</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Profile Data */}
                  <div className="lg:col-span-1">
                    {/* Profile Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg sticky top-8">
                      {loadingClient ? (
                        <div className="text-center py-8">
                          <p className="text-neutral-600 font-semibold">Loading profile...</p>
                        </div>
                      ) : (
                        <>
                          {/* Profile Avatar */}
                          <div className="text-center mb-6">
                            {clientProfileImage ? (
                              <img
                                src={clientProfileImage}
                                alt={clientData?.name}
                                className="w-24 h-24 rounded-full mx-auto object-cover mb-4 border-4"
                                style={{ borderColor: '#d97706' }}
                                onError={(e) => (e.target.style.display = 'none')}
                              />
                            ) : null}
                            <h4 className="text-xl font-black text-neutral-800">{clientData?.name || 'Client'}</h4>
                            <p className="text-xs text-neutral-600 mt-1">Client Member</p>
                          </div>

                          {/* Profile Details */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Name */}
                            <div>
                              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Full Name</p>
                              <p className="text-sm font-semibold text-neutral-800">{clientData?.name}</p>
                            </div>

                            {/* Email */}
                            <div>
                              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Email Address</p>
                              <p className="text-sm font-semibold text-neutral-800 break-all">{clientData?.email}</p>
                            </div>

                            {/* Phone */}
                            <div>
                              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Phone Number</p>
                              <p className="text-sm font-semibold text-neutral-800">{clientData?.phone}</p>
                            </div>

                            {/* Location */}
                            <div>
                              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Location</p>
                              <p className="text-sm font-semibold text-neutral-800">{clientData?.location}</p>
                            </div>

                            {/* Join Date */}
                            <div className="col-span-2">
                              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Member Since</p>
                              <p className="text-sm font-semibold text-neutral-800">{new Date(clientData?.joinDate || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="bg-gradient-to-r p-4 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)' }}>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-black text-amber-900">{clientData?.totalBookings || 0}</p>
                                <p className="text-xs font-semibold text-amber-800 mt-1">Total Bookings</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-black text-amber-900">{clientData?.rating || 0}</p>
                                <p className="text-xs font-semibold text-amber-800 mt-1">Avg Rating</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Heads - Messenger Style */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        {/* Chat Head Button */}
        {!floatingChatOpen && (
          <button
            onClick={() => setFloatingChatOpen(true)}
            className="rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #d97706 0%, #966647 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
            title="Open chat"
          >
            💬
          </button>
        )}

        {/* Floating Chat Window */}
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

            {/* Chat List - Show recent workers */}
            <div className="flex-1 overflow-y-auto border-b border-neutral-200">
              {bookingsData.length === 0 ? (
                <div className="p-3 text-center text-xs text-neutral-600">
                  No recent bookings
                </div>
              ) : (
                bookingsData.slice(0, 5).map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => {
                      setSelectedChat(booking.id);
                      setActiveTab('chat');
                      setFloatingChatOpen(false);
                    }}
                    className="w-full text-left p-3 hover:bg-neutral-50 border-b border-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                        <img src={booking.worker_image} alt={booking.worker_name} className="w-full h-full object-cover" onError={(e) => (e.target.style.display = 'none')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-neutral-800">{booking.worker_name}</p>
                        <p className="text-xs text-neutral-600 truncate">{booking.worker_category || 'Service'}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
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
                className="px-3 py-2 rounded-lg font-bold text-white text-xs transition-all hover:shadow-lg"
                style={{ background: '#d97706' }}
                onClick={() => floatingChatMessage.trim() && setFloatingChatMessage('')}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSuccess={async (imageUrl) => {
          try {
            await clientService.updateClientProfile({ image: imageUrl, profile_image: imageUrl });
            setClientData((prev) => ({ ...(prev || {}), image: imageUrl, profile_image: imageUrl }));
          } catch (error) {
            console.error('Failed to update profile image:', error);
          } finally {
            setIsImageModalOpen(false);
          }
        }}
        title="Upload Profile Picture"
        currentImage={clientData?.profile_image}
        uploadEndpoint={uploadEndpoint}
        authToken={accessToken}
      />
    </>
  );
};

export default ClientDashboard;

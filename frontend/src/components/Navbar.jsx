import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store';
import { chatService } from '../services/endpoints';
import { FaBars, FaTimes, FaBell, FaPowerOff, FaCog, FaEllipsisV } from 'react-icons/fa';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';

// Top navigation bar with links, user menu, notifications, and role-based items
const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      setNotificationsLoading(true);
      try {
        const response = await chatService.getUserConversations();
        const conversations = response.data?.conversations || response.data?.data || response.data || [];

        if (!Array.isArray(conversations) || conversations.length === 0) {
          setNotifications([]);
          return;
        }

        const mapped = conversations.map((conv) => {
          const name = conv.other_user_name ||
            `${conv.other_user_first_name || ''} ${conv.other_user_last_name || ''}`.trim() ||
            conv.worker_name ||
            conv.client_name ||
            'User';

          return {
            id: conv.id,
            name,
            action: 'sent you a message',
            actionTarget: '',
            category: 'Message',
            time: conv.updated_at || conv.last_message_at || conv.created_at || 'Just now',
            avatar: conv.other_user_avatar || conv.other_user_image || conv.worker_image || conv.client_image || null,
          };
        });

        setNotifications(mapped);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav 
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 32px 0 rgba(217, 119, 6, 0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/images/logo/logo.svg" 
              alt="Sallah Sanjal" 
              className="h-10 w-auto object-contain group-hover:opacity-80 transition-opacity duration-300"
            />
            <span 
              className="text-lg font-bold hidden sm:inline-block"
              style={{ color: '#d97706' }}
            >
              Sallah Sanjal
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/workers" className="transition-all duration-300 hover:scale-105" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 300, fontSize: '14px' }}>
                  Browse
                </Link>
                <Link to="/login" className="transition-all duration-300 hover:scale-105" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 400, fontSize: '14px' }}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-lg transform hover:scale-105 transition-all duration-300 border"
                  style={{ 
                    background: 'rgba(217, 119, 6, 0.25)',
                    color: '#d97706',
                    borderColor: 'rgba(217, 119, 6, 0.4)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                    fontSize: '16px',
                  }}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link to="/workers" className="transition-all duration-300 hover:scale-105" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 300, fontSize: '1.025rem' }}>
                  Find Professionals
                </Link>
                {user.role === 'client' && (
                  <Link to="/dashboard/client" className="transition-all duration-300 hover:scale-105" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 400, fontSize: '1.025rem' }}>
                    Dashboard
                  </Link>
                )}
                {user.role === 'worker' && (
                  <Link to="/dashboard/worker" className="transition-all duration-300 hover:scale-105" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 400, fontSize: '1.025rem' }}>
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/dashboard/admin" className="transition-all duration-300 hover:scale-105" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 400, fontSize: '1.025rem' }}>
                    Admin
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="transition-all duration-300 transform hover:scale-110"
                    style={{ color: '#d97706', fontSize: '1.25rem' }}
                    title="Notifications"
                  >
                    <FaBell />
                    {notifications.length > 0 && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#ef4444' }}>
                        {notifications.length}
                      </div>
                    )}
                  </button>

                  {/* Notification Popup */}
                  {notificationOpen && (
                    <div 
                      className="absolute top-12 right-0 rounded-2xl shadow-2xl border overflow-hidden"
                      style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(15px)',
                        borderColor: 'rgba(217, 119, 6, 0.2)',
                        zIndex: 1000,
                        width: '420px',
                        maxHeight: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Header */}
                      <div 
                        className="p-5 border-b flex items-center justify-between bg-white"
                        style={{ borderColor: '#e5e7eb' }}
                      >
                        <h3 className="font-black text-lg text-neutral-900">Notifications</h3>
                        <button 
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-all"
                          title="Notification settings"
                        >
                          <FaCog size={18} style={{ color: '#6b7280' }} />
                        </button>
                      </div>

                      {/* Notification List */}
                      <div className="overflow-y-auto flex-1">
                        {notificationsLoading && (
                          <div className="p-4 text-sm text-neutral-600">Loading notifications...</div>
                        )}
                        {!notificationsLoading && notifications.length === 0 && (
                          <div className="p-4 text-sm text-neutral-600">No notifications yet.</div>
                        )}
                        {!notificationsLoading && notifications.map((notif, index) => (
                          <div key={notif.id}>
                            <div 
                              className="p-4 hover:bg-neutral-50 transition-all cursor-pointer group"
                            >
                              <div className="flex gap-3">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                  <div
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0"
                                  >
                                    {notif.avatar ? (
                                      <img 
                                        src={notif.avatar} 
                                        alt={notif.name}
                                        className="w-full h-full rounded-full object-cover"
                                        onError={(e) => (e.target.style.display = 'none')}
                                      />
                                    ) : (
                                      notif.name.charAt(0)
                                    )}
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-bold text-neutral-900">
                                        {notif.name}
                                        {' '}
                                        <span className="font-normal text-neutral-700">
                                          {notif.action}
                                        </span>
                                        {notif.actionTarget && (
                                          <span className="font-bold text-neutral-900">
                                            {' '}{notif.actionTarget}
                                          </span>
                                        )}
                                      </p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span 
                                          className="text-xs font-bold px-2 py-1 rounded"
                                          style={{
                                            background: notif.category === 'Booking' ? 'rgba(59, 130, 246, 0.1)' :
                                                       notif.category === 'Review' ? 'rgba(245, 158, 11, 0.1)' :
                                                       notif.category === 'Payment' ? 'rgba(34, 197, 94, 0.1)' :
                                                       notif.category === 'Message' ? 'rgba(217, 119, 6, 0.1)' :
                                                       'rgba(217, 119, 6, 0.1)',
                                            color: notif.category === 'Booking' ? '#3b82f6' :
                                                   notif.category === 'Review' ? '#f59e0b' :
                                                   notif.category === 'Payment' ? '#22c55e' :
                                                   notif.category === 'Message' ? '#d97706' :
                                                   '#d97706'
                                          }}
                                        >
                                          {notif.category}
                                        </span>
                                        <span className="text-xs text-neutral-500">
                                          {notif.time}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Three-dot Menu */}
                                    <button 
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-200 rounded ml-2 flex-shrink-0"
                                      title="More options"
                                    >
                                      <FaEllipsisV size={14} style={{ color: '#9ca3af' }} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {index < notifications.length - 1 && (
                              <div style={{ borderBottomColor: '#f3f4f6', borderBottomWidth: '1px' }} />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div 
                        className="p-4 bg-white border-t text-center cursor-pointer hover:bg-neutral-50 transition-all"
                        style={{ borderColor: '#e5e7eb' }}
                      >
                        <p className="text-sm font-semibold text-neutral-700" style={{ color: '#d97706' }}>
                          View All Notifications
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="transition-all duration-300 transform hover:scale-110"
                  style={{ color: '#ef4444', fontSize: '1.25rem' }}
                  title="Logout"
                >
                  <FaPowerOff />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl transition-all duration-300 hover:scale-110"
            style={{ color: '#2d3436' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden pb-4 space-y-2 rounded-lg border-t"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
            }}
          >
            {!user ? (
              <>
                <Link to="/workers" className="block py-2 px-4 transition-all duration-200 hover:translate-x-1" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}>
                  Browse
                </Link>
                <Link to="/login" className="block py-2 px-4 transition-all duration-200 hover:translate-x-1" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}>
                  Login
                </Link>
                <Link to="/register" className="block py-2 px-4 transition-all duration-200 hover:translate-x-1" style={{ color: '#d97706', fontFamily: "'Roboto', sans-serif", fontWeight: 400 }}>
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link to="/workers" className="block py-2 px-4 transition-all duration-200 hover:translate-x-1" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}>
                  Find Professionals
                </Link>
                {user.role === 'client' && (
                  <Link to="/dashboard/client" className="block py-2 px-4 transition-all duration-200 hover:translate-x-1" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}>
                    Dashboard
                  </Link>
                )}
                {user.role === 'worker' && (
                  <Link to="/dashboard/worker" className="block py-2 px-4 transition-all duration-200 hover:translate-x-1" style={{ color: '#2d3436', fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}>
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-4 transition-all duration-200 hover:translate-x-1"
                  style={{ color: '#d97706', fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

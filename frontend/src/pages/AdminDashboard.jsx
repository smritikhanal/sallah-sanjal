import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FaHome, FaUsers, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaCog, FaSignOutAlt, FaChevronRight, FaCheck, FaTimes, FaInfo, FaEdit, FaTrash, FaEye, FaLock, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../utils/store';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { adminService, adminCategoryService } from '../services/endpoints';
const AdminDashboard = () => {
  
  const navigate = useNavigate();
  const { logout, user, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [analyticsTrends, setAnalyticsTrends] = useState(null);
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState(null);
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsRes, issuesRes, workersRes, clientsRes, testimonialsRes, trendsRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getIssues(),
        adminService.getAllWorkers(),
        adminService.getAllClients(),
        adminService.getTestimonials(),
        adminService.getAnalyticsTrends(),
      ]);

      setAnalytics(analyticsRes.data.data);
      setIssues(issuesRes.data.data || []);
      
      // Transform worker data to match expected format
      const transformedWorkers = workersRes.data.data.map((w, index) => ({
        id: w.id || w.user_id || index,
        workerId: w.id || w.user_id,
        ...w,
        name: `${w.first_name} ${w.last_name}`,
        verified: w.is_verified,
        status: w.is_verified ? 'active' : 'pending',
        rating: w.average_rating,
        category: w.services || 'General',
        joinDate: w.created_at,
        bookings: w.total_bookings || 0,
      }));
      setWorkers(transformedWorkers);
      
      // Transform client data
      const transformedClients = clientsRes.data.data.map(c => ({
        ...c,
        clientId: c.clientId,
        name: `${c.first_name} ${c.last_name}`,
        status: c.status ? 'active' : 'inactive',
      }));
      setClients(transformedClients);
      
      // Transform testimonial data
      const transformedTestimonials = testimonialsRes.data.data.map(t => ({
        ...t,
        id: t.id,
        title: t.title,
        author: `${t.authorFirstName} ${t.authorLastName}`,
        visible: t.visible,
      }));
      setTestimonials(transformedTestimonials);
      
      setAnalyticsTrends(trendsRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      await adminService.updateIssueStatus(issueId, { status: newStatus });
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));
    } catch (err) {
      console.error('Error updating issue:', err);
      toast.error('Failed to update issue status');
    }
  };

  const verifyWorker = async (workerId) => {
    try {
      await adminService.verifyWorker(workerId, { approve: true });
      setWorkers(workers.map(worker =>
        worker.workerId === workerId ? { ...worker, verified: true, status: 'active' } : worker
      ));
    } catch (err) {
      console.error('Error verifying worker:', err);
      toast.error('Failed to verify worker');
    }
  };

  const deleteClient = (clientId) => {
    setClients(clients.filter(client => client.clientId !== clientId));
  };

  const updateClient = (clientId, updatedData) => {
    setClients(clients.map(client =>
      client.clientId === clientId ? { ...client, ...updatedData } : client
    ));
  };

  const toggleTestimonialVisibility = async (testimonialId) => {
    try {
      const testimonial = testimonials.find(t => t.id === testimonialId);
      const newVisibility = !testimonial.visible;
      await adminService.updateTestimonialVisibility(testimonialId, { visible: newVisibility });
      setTestimonials(testimonials.map(t =>
        t.id === testimonialId ? { ...t, visible: newVisibility } : t
      ));
    } catch (err) {
      console.error('Error updating testimonial:', err);
      toast.error('Failed to update testimonial visibility');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

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

    setPasswordLoading(true);
    try {
      // TODO: Call API endpoint to change password
      setPasswordSuccess('Password changed successfully! ✓');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: '#fed7aa', text: '#92400e', label: 'Pending', icon: <FaExclamationTriangle /> },
      acknowledged: { bg: '#bfdbfe', text: '#0c2d6d', label: 'Acknowledged', icon: <FaInfo /> },
      solved: { bg: '#d1fae5', text: '#065f46', label: 'Solved', icon: <FaCheck /> },
      denied: { bg: '#fee2e2', text: '#7f1d1d', label: 'Denied', icon: <FaTimes /> },
    };
    return statusMap[status] || statusMap.pending;
  };

  const getIssueTypeColor = (type) => {
    const colorMap = {
      Complaint: '#ef4444',
      Dispute: '#f59e0b',
      'Bug Report': '#8b5cf6',
      'Payment Issue': '#ec4899',
    };
    return colorMap[type] || '#6b7280';
  };

  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const solvedCount = issues.filter(i => i.status === 'solved').length;
  const deniedCount = issues.filter(i => i.status === 'denied').length;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-neutral-600">Loading dashboard...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-bold mb-4">Error loading dashboard</p>
            <p className="text-neutral-600 mb-4">{error}</p>
            <button 
              onClick={fetchAllData}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

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
  `;

  return (
    <>
      <style>{animationStyle}</style>
      <Navbar />
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
        {/* Top Navigation Tabs */}
        <div className="bg-white shadow-md sticky top-0 z-40" style={{ borderBottom: '2px solid #e5e7eb', display: 'flex', justifyContent: 'center' }}>
          <div className="py-4 flex items-center justify-center gap-6 flex-wrap">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'issues', label: 'Issues' },
              { id: 'workers', label: 'Workers' },
              { id: 'clients', label: 'Clients' },
              { id: 'testimonials', label: 'Testimonials' },
              { id: 'categories', label: 'Categories' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-6 py-3 font-bold transition-all whitespace-nowrap border-b-4 hover:text-orange-600"
                style={{
                  borderColor: activeTab === tab.id ? '#d97706' : 'transparent',
                  color: activeTab === tab.id ? '#d97706' : '#6b7280',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto p-8">
            {/* Dashboard Overview */}
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-4xl font-black text-neutral-800 mb-8">Overview</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                  {[
                    { label: 'Total Customers', value: analytics?.totalCustomers || 0, icon: <FaUsers size={24} />, color: '#3b82f6' },
                    { label: 'Total Workers', value: analytics?.totalWorkers || 0, icon: <FaUsers size={24} />, color: '#8b5cf6' },
                    { label: 'Total Bookings', value: analytics?.totalBookings || 0, icon: <FaExclamationTriangle size={24} />, color: '#ef4444' },
                    { label: 'Pending Bookings', value: analytics?.pendingBookings || 0, icon: <FaExclamationTriangle size={24} />, color: '#f59e0b' },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-md"
                      style={{
                        borderTop: `4px solid ${stat.color}`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div style={{ color: stat.color }}>{stat.icon}</div>
                        <div>
                          <p className="text-xs text-neutral-600 font-semibold uppercase">{stat.label}</p>
                          <p className="text-3xl font-black text-neutral-800">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Solved Issues', value: solvedCount, color: '#10b981' },
                    { label: 'Denied Issues', value: deniedCount, color: '#ef4444' },
                    { label: 'Acknowledged', value: issues.filter(i => i.status === 'acknowledged').length, color: '#3b82f6' },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-md text-center"
                      style={{ borderColor: stat.color, borderTop: `4px solid ${stat.color}` }}
                    >
                      <p className="text-sm text-neutral-600 font-semibold mb-2">{stat.label}</p>
                      <p className="text-4xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manage Issues Tab */}
            {activeTab === 'issues' && (
              <div>
                <h1 className="text-4xl font-black text-neutral-800 mb-8">Manage Issues</h1>
                
                <div className="space-y-4">
                  {issues.map((issue) => {
                    const statusBadge = getStatusBadge(issue.status);
                    return (
                      <div
                        key={issue.id}
                        className="issue-card bg-white rounded-2xl p-6 shadow-md border-l-4 hover:shadow-lg transition-all"
                        style={{ borderColor: getIssueTypeColor(issue.issueType) }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                          {/* Issue Details */}
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                                style={{ background: getIssueTypeColor(issue.issueType) }}
                              >
                                {issue.issueType}
                              </div>
                              <p className="text-xs text-neutral-600">{issue.userType}</p>
                            </div>
                            <p className="font-bold text-neutral-800 text-sm mb-1">Reported by: {issue.reportedBy}</p>
                            <p className="text-sm text-neutral-700 line-clamp-2">{issue.description}</p>
                            <p className="text-xs text-neutral-500 mt-2">{issue.reportedDate}</p>
                          </div>

                          {/* Status */}
                          <div className="md:col-span-1 text-center">
                            <div
                              className="inline-flex px-4 py-2 rounded-lg font-semibold text-sm items-center gap-2"
                              style={{ background: statusBadge.bg, color: statusBadge.text }}
                            >
                              {statusBadge.icon}
                              {statusBadge.label}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="md:col-span-2 flex gap-2 justify-end">
                            <button
                              onClick={() => updateIssueStatus(issue.id, 'acknowledged')}
                              className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md text-white"
                              style={{ background: '#3b82f6' }}
                              title="Mark as Acknowledged"
                            >
                              <FaInfo size={14} /> Acknowledge
                            </button>
                            <button
                              onClick={() => updateIssueStatus(issue.id, 'solved')}
                              className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md text-white"
                              style={{ background: '#10b981' }}
                              title="Mark as Solved"
                            >
                              <FaCheck size={14} /> Solved
                            </button>
                            <button
                              onClick={() => updateIssueStatus(issue.id, 'denied')}
                              className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-md text-white"
                              style={{ background: '#ef4444' }}
                              title="Mark as Denied"
                            >
                              <FaTimes size={14} /> Deny
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Users & Workers Tab */}
            {activeTab === 'users' && (
              <div>
                <h1 className="text-4xl font-black text-neutral-800 mb-8">Users & Workers Management</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-8 shadow-md">
                    <h2 className="text-2xl font-black text-neutral-800 mb-4">Registered Clients</h2>
                    <p className="text-5xl font-black mb-4" style={{ color: '#3b82f6' }}>{analytics?.totalCustomers || 0}</p>
                    <p className="text-neutral-600">Active users using the platform for service booking</p>
                  </div>
                  <div className="bg-white rounded-2xl p-8 shadow-md">
                    <h2 className="text-2xl font-black text-neutral-800 mb-4">Registered Workers</h2>
                    <p className="text-5xl font-black mb-4" style={{ color: '#8b5cf6' }}>{analytics?.totalWorkers || 0}</p>
                    <p className="text-neutral-600">Active service providers offering their services</p>
                  </div>
                </div>
              </div>
            )}

            {/* Worker List Tab */}
            {activeTab === 'workers' && (
              <div>
                <h1 className="text-4xl font-black text-neutral-800 mb-8">Worker List Management</h1>
                
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase">Rating</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase">Bookings</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.map((worker) => (
                        <tr key={worker.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td className="px-6 py-4">
                            <p className="font-bold text-neutral-800">{worker.name}</p>
                            <p className="text-xs text-neutral-600">{worker.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>
                              {worker.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-neutral-800">⭐ {worker.rating}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-neutral-800">{worker.bookings}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="px-3 py-1 rounded-lg text-xs font-bold"
                              style={{
                                background: worker.verified ? '#d1fae5' : '#fed7aa',
                                color: worker.verified ? '#065f46' : '#92400e',
                              }}
                            >
                              {worker.verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedWorkerDetail(worker)}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-md"
                                style={{ background: '#3b82f6' }}
                                title="View Details"
                              >
                                <FaEye size={14} /> View
                              </button>
                              {!worker.verified && (
                                <button
                                  onClick={() => verifyWorker(worker.workerId)}
                                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-md"
                                  style={{ background: '#10b981' }}
                                  title="Verify Worker"
                                >
                                  <FaCheck size={14} /> Verify
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Worker Detail Modal */}
                {selectedWorkerDetail && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-neutral-800">Worker Details</h2>
                        <button
                          onClick={() => setSelectedWorkerDetail(null)}
                          className="text-2xl text-neutral-400 hover:text-neutral-600"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Name</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedWorkerDetail.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Email</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedWorkerDetail.email}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Phone</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedWorkerDetail.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Category</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedWorkerDetail.category}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Join Date</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedWorkerDetail.joinDate}</p>
                        </div>
                        <button
                          onClick={() => setSelectedWorkerDetail(null)}
                          className="w-full mt-6 py-2 rounded-lg font-bold text-white transition-all"
                          style={{ background: '#d97706' }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Client List Tab */}
            {activeTab === 'clients' && (
              <div>
                <h1 className="text-4xl font-black text-neutral-800 mb-8">Client List Management</h1>
                
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.clientId} className="bg-white rounded-2xl p-6 shadow-md border-l-4" style={{ borderColor: '#d97706' }}>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="font-bold text-neutral-800">{client.name}</p>
                          <p className="text-xs text-neutral-600">{client.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600 mb-1">Phone</p>
                          <p className="text-sm font-semibold text-neutral-800">{client.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600 mb-1">Bookings</p>
                          <p className="text-sm font-bold text-neutral-800">{client.totalBookings}</p>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedClientDetail(client)}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-md"
                            style={{ background: '#3b82f6' }}
                            title="View Details"
                          >
                            <FaEye size={14} /> View
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
                                deleteClient(client.clientId);
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-md"
                            style={{ background: '#ef4444' }}
                            title="Delete Client"
                          >
                            <FaTrash size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Client Detail Modal */}
                {selectedClientDetail && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-neutral-800">Client Details</h2>
                        <button
                          onClick={() => setSelectedClientDetail(null)}
                          className="text-2xl text-neutral-400 hover:text-neutral-600"
                        >
                          ×
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Name</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedClientDetail.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Email</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedClientDetail.email}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Phone</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedClientDetail.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Location</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedClientDetail.location}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Total Bookings</p>
                          <p className="text-sm font-semibold text-neutral-800">{selectedClientDetail.totalBookings}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Status</p>
                          <span
                            className="px-3 py-1 rounded-lg text-xs font-bold"
                            style={{
                              background: selectedClientDetail.status === 'active' ? '#d1fae5' : '#fee2e2',
                              color: selectedClientDetail.status === 'active' ? '#065f46' : '#7f1d1d',
                            }}
                          >
                            {selectedClientDetail.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedClientDetail(null)}
                          className="w-full mt-6 py-2 rounded-lg font-bold text-white transition-all"
                          style={{ background: '#d97706' }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h1 className="text-4xl font-black text-neutral-800 mb-8">Admin Settings</h1>
                
                <div className="bg-white rounded-2xl p-8 shadow-md max-w-2xl">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-8 flex items-center gap-3">
                    <FaLock style={{ color: '#d97706' }} /> Change Password
                  </h2>

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
                      <p className="text-xs text-neutral-500 mt-2">At least 6 characters</p>
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

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
                      style={{ background: '#d97706', opacity: passwordLoading ? 0.7 : 1 }}
                    >
                      {passwordLoading ? '⏳ Updating Password...' : (<><FaCheck size={16} /> Update Password</>)}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Testimonials Tab */}
            {activeTab === 'testimonials' && (
              <div>
                <h1 className="text-4xl font-black text-neutral-800 mb-8">Platform Testimonials</h1>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 font-semibold">📊 Total Testimonials: {testimonials.length} | Visible: {testimonials.filter(t => t.visible).length} | Hidden: {testimonials.filter(t => !t.visible).length}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white rounded-2xl p-6 shadow-md border-l-4" style={{ borderColor: '#d97706', opacity: testimonial.visible ? 1 : 0.5 }}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="font-bold text-neutral-900">{testimonial.title}</p>
                          <p className="text-xs text-neutral-600">From: {testimonial.author}</p>
                          <div className="flex gap-1 mt-2">
                            {Array(testimonial.rating).fill(0).map((_, i) => (
                              <FaStar key={i} size={14} style={{ color: '#d97706' }} />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 ml-4">
                          <button
                            onClick={() => toggleTestimonialVisibility(testimonial.id)}
                            className="px-4 py-2 rounded-lg font-bold text-sm transition-all"
                            style={{
                              background: testimonial.visible ? '#10b981' : '#ef4444',
                              color: 'white',
                            }}
                            title={testimonial.visible ? 'Click to hide' : 'Click to show'}
                          >
                            {testimonial.visible ? '✓ Show' : '✕ Hide'}
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-700">{testimonial.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <h1 className="text-4xl font-black text-neutral-800 mb-8">Category Management</h1>
                <p className="text-neutral-600 mb-6">Create, edit, or remove service categories.</p>
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <p className="text-sm text-neutral-500">Category management UI will go here. Admin can add, rename, or delete service categories.</p>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h1 className="text-4xl font-black text-neutral-800 mb-8">Analytics & Reports</h1>
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                  {[
                    { label: 'Total Revenue', value: `Rs. ${(analytics?.totalRevenue || 0).toLocaleString()}`, color: '#10b981' },
                    { label: 'Total Bookings', value: analytics?.totalBookings || 0, color: '#3b82f6' },
                    { label: 'Total Workers', value: analytics?.totalWorkers || 0, color: '#8b5cf6' },
                    { label: 'Total Customers', value: analytics?.totalCustomers || 0, color: '#f59e0b' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-md border-t-4" style={{ borderColor: stat.color }}>
                      <p className="text-xs text-neutral-600 font-semibold uppercase mb-2">{stat.label}</p>
                      <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Revenue Trend Line Chart */}
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsTrends?.revenueData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bookings by Category Bar Chart */}
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">Bookings by Service Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsTrends?.categoryData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* User Distribution Pie Chart */}
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">User Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsTrends?.userDistribution?.map((item, idx) => ({
                            name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
                            value: item.count,
                            fill: ['#3b82f6', '#8b5cf6', '#d97706', '#10b981'][idx] || '#6b7280'
                          })) || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(analyticsTrends?.userDistribution || []).map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={['#3b82f6', '#8b5cf6', '#d97706', '#10b981'][idx] || '#6b7280'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Monthly Active Users Area Chart */}
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">Monthly Active Users</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analyticsTrends?.activeUsers || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="activeClients" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="activeWorkers" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
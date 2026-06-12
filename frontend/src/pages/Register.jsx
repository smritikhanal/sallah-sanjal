import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/endpoints';
import { useAuthStore } from '../utils/store';
import Navbar from '../components/Navbar';
import ImageUploadModal from '../components/ImageUploadModal';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone, FaArrowRight, FaGoogle, FaApple, FaCheckCircle, FaCamera } from 'react-icons/fa';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: searchParams.get('role') || 'client',
    profileImage: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const uploadEndpoint = `${apiBaseUrl}/uploads/profile-image`;
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.register(formData);
      setTokens(response.data.accessToken, response.data.refreshToken);
      setUser({ id: response.data.userId, role: formData.role });
      navigate(`/dashboard/${formData.role}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
        {/* Animated Background Shapes */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 100%)', animation: 'float 6s cubic-bezier(0.4, 0.0, 0.2, 1) infinite' }}></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #966647 0%, transparent 100%)', animation: 'float 8s cubic-bezier(0.4, 0.0, 0.2, 1) infinite 2s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto py-12 px-4 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Benefits & Info */}
            <div className="hidden lg:block pt-12">
              <h1 className="text-5xl font-black mb-6" style={{ color: '#2d2d2d' }}>
                Join Our
                <br />
                <span style={{ background: 'linear-gradient(135deg, #d97706 0%, #966647 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Growing Network</span>
              </h1>
              <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
                {formData.role === 'client' 
                  ? 'Connect with vetted professionals and get quality work done. Find the perfect person for any job.'
                  : 'Grow your business, reach more clients, and earn from your skills. Join thousands of successful professionals.'}
              </p>

              {/* Benefits Grid */}
              <div className="space-y-4">
                {(formData.role === 'client' 
                  ? [
                      { title: 'Quality Professionals', desc: 'Thoroughly vetted experts' },
                      { title: 'Transparent Pricing', desc: 'Clear rates, no hidden fees' },
                      { title: 'Instant Booking', desc: 'Schedule immediately' },
                      { title: 'Secure Payments', desc: 'Protected transactions' },
                    ]
                  : [
                      { title: 'Reach More Clients', desc: 'Access thousands of opportunities' },
                      { title: 'Flexible Schedule', desc: 'Choose your own hours' },
                      { title: 'Build Your Profile', desc: 'Showcase your expertise' },
                      { title: 'Earn More', desc: 'Competitive rates & bonuses' },
                    ]
                ).map((benefit, idx) => (
                  <div key={idx} className="flex gap-4 items-start group cursor-pointer">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1" style={{ background: '#d97706', color: 'white', fontWeight: 'bold' }}>
                      <FaCheckCircle />
                    </div>
                    <div className="group-hover:translate-x-2 transition-transform">
                      <h4 className="font-bold text-neutral-800">{benefit.title}</h4>
                      <p className="text-sm text-neutral-600">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-12 p-6 rounded-2xl" style={{ background: 'rgba(217, 119, 6, 0.1)' }}>
                <p className="text-sm text-neutral-600 mb-4 font-semibold">Join the Movement</p>
                <div className="flex gap-6">
                  <div>
                    <p className="text-3xl font-black" style={{ color: '#d97706' }}>500+</p>
                    <p className="text-xs text-neutral-600">Professionals</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black" style={{ color: '#d97706' }}>2.5k+</p>
                    <p className="text-xs text-neutral-600">Happy clients</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black" style={{ color: '#d97706' }}>98%</p>
                    <p className="text-xs text-neutral-600">Success rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full">
                            {/* Header Note */}
              <p className="text-center text-xs text-neutral-600 mt-6 pb-5">
                By signing up, you agree to our <a href="#" className="underline hover:text-neutral-800">Terms of Service</a> and <a href="#" className="underline hover:text-neutral-800">Privacy Policy</a>
              </p>
              {/* Registration form card */}
              <div
                className="rounded-3xl p-8 md:p-10 shadow-2xl border border-white/30"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-neutral-800 mb-2">Create Account</h2>
                  <p className="text-neutral-600">Join our professional community</p>
                </div>

                {/* Role Selection Tabs */}
                <div className="flex gap-4 mb-8 p-1 bg-neutral-100 rounded-xl">
                  {[
                    { id: 'client', label: ' Client', icon: '🔍' },
                    { id: 'worker', label: ' Professional', icon: '⭐' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-sm"
                      style={{
                        background: formData.role === role.id ? '#d97706' : 'transparent',
                        color: formData.role === role.id ? 'white' : '#6b7280',
                      }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 rounded-lg flex items-start gap-3 border-l-4" style={{ background: '#fee2e2', borderColor: '#dc2626' }}>
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-800">Registration failed</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-3">First Name</label>
                      <div className="relative group">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none transition-all duration-300"
                          onFocus={(e) => (e.target.style.borderColor = '#d97706')}
                          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-3">Last Name</label>
                      <div className="relative group">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none transition-all duration-300"
                          onFocus={(e) => (e.target.style.borderColor = '#d97706')}
                          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-3">Email Address</label>
                    <div className="relative group">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none transition-all duration-300"
                        onFocus={(e) => (e.target.style.borderColor = '#d97706')}
                        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-3">Phone Number</label>
                    <div className="relative group">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none transition-all duration-300"
                        onFocus={(e) => (e.target.style.borderColor = '#d97706')}
                        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                        placeholder="+977 9800000000"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-3">Password</label>
                    <div className="relative group">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none transition-all duration-300"
                        onFocus={(e) => (e.target.style.borderColor = '#d97706')}
                        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-orange-600 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <label className="flex items-start gap-2 cursor-pointer mt-4">
                    <input type="checkbox" className="mt-1 rounded" style={{ accentColor: '#d97706' }} required />
                    <span className="text-xs text-neutral-600">
                      I agree to the <a href="#" className="text-orange-600 font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-orange-600 font-semibold hover:underline">Privacy Policy</a>
                    </span>
                  </label>


                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-lg font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:translate-y-[-2px] disabled:opacity-60 disabled:cursor-not-allowed mt-6"
                    style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #d97706 0%, #966647 100%)' }}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span> Creating account...
                      </>
                    ) : (
                      <>
                        Create Account <FaArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSuccess={(imageUrl) => {
          setFormData({ ...formData, profileImage: imageUrl });
          setIsImageModalOpen(false);
        }}
        title="Upload Profile Picture"
        currentImage={formData.profileImage}
        uploadEndpoint={uploadEndpoint}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }
      `}</style>
    </>
  );
};

export default Register;

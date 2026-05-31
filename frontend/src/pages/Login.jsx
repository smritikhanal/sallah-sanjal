import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/endpoints';
import { useAuthStore } from '../utils/store';
import Navbar from '../components/Navbar';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaArrowRight, FaGoogle, FaApple } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState('client'); // 'client' or 'professional'
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setTokens } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      setTokens(response.data.accessToken, response.data.refreshToken);
      setUser({ id: response.data.userId, role: response.data.role });
      navigate(location.state?.returnTo || `/dashboard/${response.data.role}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Message */}
            <div className="hidden lg:block">
              <h1 className="text-5xl font-black mb-6" style={{ color: '#2d2d2d' }}>
                Welcome to
                <br />
                <span style={{ background: 'linear-gradient(135deg, #d97706 0%, #966647 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sallah Sanjal</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Connect with skilled professionals or grow your career. Access quality services or showcase your expertise.
              </p>

              {/* Features List */}
              <div className="space-y-4">
                {[
                  { title: 'Verified Professionals', desc: 'Trust quality work from certified experts' },
                  { title: 'Easy Booking', desc: 'Schedule services in just a few clicks' },
                  { title: '24/7 Support', desc: 'Help whenever you need it' },
                  { title: 'Secure Payments', desc: 'Protected transactions & safe transfers' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4 items-start group cursor-pointer">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1" style={{ background: '#d97706', color: 'white', fontWeight: 'bold' }}>
                      ✓
                    </div>
                    <div className="group-hover:translate-x-2 transition-transform">
                      <h4 className="font-bold text-neutral-800">{feature.title}</h4>
                      <p className="text-sm text-neutral-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                {[
                  { number: '500+', label: 'Professionals' },
                  { number: '2.5k+', label: 'Satisfied Clients' },
                  { number: '98%', label: 'Success Rate' },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-3xl font-black" style={{ color: '#d97706' }}>{stat.number}</p>
                    <p className="text-xs text-neutral-600 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full">
                            {/* Header Note */}
              <p className="text-center text-xs text-neutral-600 mt-6 pb-5">
                By signing in, you agree to our <a href="#" className="underline hover:text-neutral-800">Terms of Service</a> and <a href="#" className="underline hover:text-neutral-800">Privacy Policy</a>
              </p>
              {/* Card */}
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
                  <h2 className="text-3xl font-black text-neutral-800 mb-2">Welcome Back</h2>
                  <p className="text-neutral-600">Sign in to your account</p>
                </div>

                {/* Role Tabs */}
                <div className="flex gap-4 mb-8 p-1 bg-neutral-100 rounded-xl">
                  {[
                    { id: 'client', label: ' Client', icon: '🔍' },
                    { id: 'professional', label: ' Professional', icon: '⭐' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setUserRole(role.id)}
                      className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-sm"
                      style={{
                        background: userRole === role.id ? '#d97706' : 'transparent',
                        color: userRole === role.id ? 'white' : '#6b7280',
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
                      <p className="font-semibold text-red-800">Login failed</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        style={{ focusBorder: '2px solid #d97706' }}
                        onFocus={(e) => (e.target.style.borderColor = '#d97706')}
                        onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                        placeholder="you@example.com"
                        required
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
                        style={{ focusBorder: '2px solid #d97706' }}
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

                  {/* Remember Me & Forgot Password */}
                  <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" style={{ accentColor: '#d97706' }} />
                      <span className="text-neutral-600">Remember me</span>
                    </label>
                    <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">Forgot password?</a>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-lg font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:translate-y-[-2px] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: loading ? '#9ca3af' : 'linear-gradient(135deg, #d97706 0%, #966647 100%)' }}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span> Signing in...
                      </>
                    ) : (
                      <>
                        Sign In <FaArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                {/* <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-neutral-200"></div>
                  <span className="text-neutral-500 text-sm">or continue with</span>
                  <div className="flex-1 h-px bg-neutral-200"></div>
                </div> */}

                {/* Social Login */}
                {/* <div className="grid grid-cols-2 gap-4 mb-6">
                  <button className="py-3 border-2 border-neutral-200 rounded-xl font-semibold transition-all hover:border-orange-400 hover:bg-orange-50 flex items-center justify-center gap-2 text-neutral-700">
                    <FaGoogle size={18} /> Google
                  </button>
                  <button className="py-3 border-2 border-neutral-200 rounded-xl font-semibold transition-all hover:border-orange-400 hover:bg-orange-50 flex items-center justify-center gap-2 text-neutral-700">
                    <FaApple size={18} /> Apple
                  </button>
                </div> */}

                {/* Sign Up Link */}
                {/* <div className="text-center pt-6 border-t border-neutral-200">
                  <p className="text-neutral-600 mb-2">
                    Don't have an account?{' '}
                    <a href="/register" className="text-orange-600 font-bold hover:text-orange-700 transition-colors">
                      Sign up now
                    </a>
                  </p>
                </div> */}

                {/* Demo Credentials */}
                {/* <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100">
                  <p className="text-xs font-bold text-orange-900 mb-3 uppercase tracking-wider">Demo Credentials</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-orange-700 font-semibold">Email:</span>
                      <code className="bg-white px-2 py-1 rounded text-neutral-700">demo@example.com</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700 font-semibold">Password:</span>
                      <code className="bg-white px-2 py-1 rounded text-neutral-700">password</code>
                    </div>
                  </div>
                </div> */}
              </div>

            
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }
      `}</style>
    </>
  );
};

export default Login;

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope, FaMap, FaClock } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <img
              src="/images/logo/logo.png"
              alt="Sallah Sanjal"
              className="h-12 w-auto object-contain"
            />
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting skilled professionals with opportunities across Nepal. Your trusted marketplace for quality work.
            </p>
            <div className="flex gap-4 pt-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors" aria-label="Facebook"><FaFacebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors" aria-label="Twitter"><FaTwitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors" aria-label="Instagram"><FaInstagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors" aria-label="LinkedIn"><FaLinkedin size={20} /></a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">For Clients</h4>
            <ul className="space-y-2">
              <li><Link to="/workers" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Browse Professionals</Link></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Categories</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Reviews & Ratings</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Pricing</a></li>
              <li><Link to="/help" className="text-orange-400 text-sm hover:text-orange-300 transition-colors font-semibold">Help & FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">For Professionals</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Join Us</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Create Profile</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Available Jobs</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Earn More</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Resources</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaPhone className="text-orange-500 mt-1" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-300">+977 1 4123456</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-orange-500 mt-1" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-300">info@sallahsanjal.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaMap className="text-orange-500 mt-1" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm text-gray-300">Kathmandu, Nepal</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaClock className="text-orange-500 mt-1" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Hours</p>
                  <p className="text-sm text-gray-300">9 AM - 6 PM (NPT)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h4 className="text-xl font-bold text-white mb-2">Subscribe to Our Newsletter</h4>
            <p className="text-gray-400 text-sm mb-6">Get exclusive deals, job updates, and professional tips directly to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Email for newsletter"
              />
              <button
                className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: '#d97706' }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            <p>&copy; 2026 Sallah Sanjal. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Cookie Policy</a>
            <Link to="/help" className="text-orange-400 hover:text-orange-300 transition-colors font-semibold">Help</Link>
          </div>
        </div>
      </div>
      <div
        className="h-1"
        style={{ background: 'linear-gradient(to right, #d97706, transparent, #d97706)' }}
      />
    </footer>
  );
};

export default Footer;

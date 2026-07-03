import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaSearch, FaChevronDown, FaQuestionCircle, FaBook, FaCreditCard, FaUser, FaHandshake, FaExclamationTriangle, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const faqData = [
  {
    category: 'Booking',
    icon: <FaBook size={18} />,
    questions: [
      { q: 'How do I book a service?', a: 'Browse professionals, select one, and click "Book Now". Fill in your details (date, time, location) and confirm. The worker will respond to your request within a few hours.' },
      { q: 'Can I cancel a booking?', a: 'Yes, you can cancel a booking from your dashboard before the worker accepts it. Once accepted, contact the worker directly through chat to arrange cancellation.' },
      { q: 'How do I know if my booking is confirmed?', a: 'You will receive a notification and the booking status will update to "Confirmed" in your dashboard once the worker accepts your request.' },
      { q: 'Can I reschedule a booking?', a: 'Contact the worker through the chat feature to discuss rescheduling. Both parties can agree on a new time and date.' },
    ],
  },
  {
    category: 'Payments',
    icon: <FaCreditCard size={18} />,
    questions: [
      { q: 'What payment methods are accepted?', a: 'We accept QR code payments, bank transfers, and cash payments. Payment is made after the service is completed to your satisfaction.' },
      { q: 'Is my payment information secure?', a: 'Yes, we use industry-standard encryption and secure payment processing. Your financial details are never shared with workers.' },
      { q: 'When do I need to pay?', a: 'Payment is made after the service is completed. This ensures you receive quality work before releasing funds.' },
    ],
  },
  {
    category: 'Accounts',
    icon: <FaUser size={18} />,
    questions: [
      { q: 'How do I create an account?', a: 'Click "Sign Up" on the top right, fill in your details (name, email, password), and select your role (Client or Professional).' },
      { q: 'I forgot my password. What should I do?', a: 'Click "Forgot Password" on the login page and follow the instructions to reset your password via email.' },
      { q: 'How do I update my profile?', a: 'Go to your Dashboard and navigate to the Settings tab. You can update your name, email, phone, and profile picture there.' },
      { q: 'Can I delete my account?', a: 'Contact our support team at info@sallahsanjal.com to request account deletion.' },
    ],
  },
  {
    category: 'Worker Hiring',
    icon: <FaHandshake size={18} />,
    questions: [
      { q: 'How do I find the right professional?', a: 'Use the search filters to narrow down by category, location, rating, and hourly rate. Read reviews and check their profile before booking.' },
      { q: 'Are workers verified?', a: 'Yes, we verify professionals through a screening process. Look for the verified badge on worker profiles for trusted professionals.' },
      { q: 'What if I am not satisfied with the service?', a: 'Contact the worker directly to discuss your concerns. If unresolved, reach out to our support team for assistance.' },
    ],
  },
  {
    category: 'Support & Issues',
    icon: <FaExclamationTriangle size={18} />,
    questions: [
      { q: 'How do I report a problem?', a: 'You can report issues through your dashboard under the Issues tab, or contact our support team directly via email.' },
      { q: 'How quickly does support respond?', a: 'Our support team typically responds within 24 hours during business days (9 AM - 6 PM NPT).' },
      { q: 'Can I get a refund?', a: 'Refund requests are handled on a case-by-case basis. Please contact support with your booking details for assistance.' },
    ],
  },
];

const HelpFaq = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Booking');
  const [openItems, setOpenItems] = useState({});

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqData;
    const q = searchQuery.toLowerCase();
    return faqData
      .map(cat => ({
        ...cat,
        questions: cat.questions.filter(item =>
          item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.questions.length > 0);
  }, [searchQuery]);

  const toggleItem = (key) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = faqData.map(c => c.category);

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
        <div
          className="relative overflow-hidden py-16 px-4"
          style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white" style={{ filter: 'blur(60px)' }} />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white" style={{ filter: 'blur(80px)' }} />
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">How can we help you?</h1>
            <p className="text-orange-100 text-lg mb-8">Find answers to common questions or get in touch with our support team</p>
            <div className="relative max-w-xl mx-auto">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-12 pr-6 py-4 rounded-2xl text-neutral-800 placeholder-neutral-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 text-lg"
                aria-label="Search frequently asked questions"
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {!searchQuery && (
            <>
              <div className="flex flex-wrap gap-3 mb-10 justify-center" role="tablist" aria-label="FAQ categories">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    role="tab"
                    aria-selected={activeCategory === cat}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                    style={{
                      background: activeCategory === cat ? '#d97706' : 'white',
                      color: activeCategory === cat ? 'white' : '#374151',
                      boxShadow: activeCategory === cat ? '0 4px 12px rgba(217, 119, 6, 0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                  >
                    {faqData.find(c => c.category === cat)?.icon}
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-3 mb-16" role="tabpanel" aria-label={`${activeCategory} questions`}>
                <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-3">
                  <FaQuestionCircle className="text-orange-500" />
                  {activeCategory}
                </h2>
                {faqData
                  .find(c => c.category === activeCategory)
                  ?.questions.map((item, idx) => {
                    const key = `${activeCategory}-${idx}`;
                    const isOpen = openItems[key];
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50 transition-colors"
                          aria-expanded={isOpen}
                          aria-controls={`faq-answer-${key}`}
                        >
                          <span className="font-semibold text-neutral-800 pr-4">{item.q}</span>
                          <FaChevronDown
                            className={`text-orange-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {isOpen && (
                          <div
                            id={`faq-answer-${key}`}
                            className="px-5 pb-5 text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4"
                          >
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {searchQuery && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                {filteredFaqs.reduce((sum, c) => sum + c.questions.length, 0)} result{filteredFaqs.reduce((sum, c) => sum + c.questions.length, 0) !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
              </h2>
              {filteredFaqs.map((cat, catIdx) => (
                <div key={cat.category} className="mb-8">
                  <h3 className="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2">
                    {cat.icon} {cat.category}
                  </h3>
                  <div className="space-y-3">
                    {cat.questions.map((item, idx) => {
                      const key = `search-${catIdx}-${idx}`;
                      const isOpen = openItems[key];
                      return (
                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                          <button
                            onClick={() => toggleItem(key)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50 transition-colors"
                            aria-expanded={isOpen}
                            aria-controls={`faq-answer-${key}`}
                          >
                            <span className="font-semibold text-neutral-800 pr-4">{item.q}</span>
                            <FaChevronDown className={`text-orange-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isOpen && (
                            <div id={`faq-answer-${key}`} className="px-5 pb-5 text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                  <FaSearch size={48} className="mx-auto text-neutral-300 mb-4" />
                  <p className="text-xl font-semibold text-neutral-600 mb-2">No results found</p>
                  <p className="text-neutral-500">Try different keywords or browse categories above</p>
                </div>
              )}
            </div>
          )}

          <div
            className="rounded-3xl p-8 md:p-12 shadow-lg border"
            style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)', borderColor: 'rgba(217, 119, 6, 0.2)' }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-neutral-800 mb-3">Still need help?</h2>
              <p className="text-neutral-600">Our support team is ready to assist you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <a
                href="mailto:info@sallahsanjal.com"
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#fee7d4' }}>
                  <FaEnvelope size={24} style={{ color: '#d97706' }} />
                </div>
                <h4 className="font-bold text-neutral-800">Email Us</h4>
                <p className="text-sm text-neutral-500 text-center">info@sallahsanjal.com</p>
                <p className="text-xs text-orange-600 font-semibold">We respond within 24 hrs</p>
              </a>
              <a
                href="tel:+97714123456"
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#fee7d4' }}>
                  <FaPhone size={24} style={{ color: '#d97706' }} />
                </div>
                <h4 className="font-bold text-neutral-800">Call Us</h4>
                <p className="text-sm text-neutral-500 text-center">+977 1 4123456</p>
                <p className="text-xs text-orange-600 font-semibold">9 AM - 6 PM (NPT)</p>
              </a>
              <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#fee7d4' }}>
                  <FaMapMarkerAlt size={24} style={{ color: '#d97706' }} />
                </div>
                <h4 className="font-bold text-neutral-800">Visit Us</h4>
                <p className="text-sm text-neutral-500 text-center">Kathmandu, Nepal</p>
                <p className="text-xs text-orange-600 font-semibold">Office hours only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HelpFaq;

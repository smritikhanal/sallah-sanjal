// Landing page with hero, category carousel, top workers, stats, and testimonials

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store';
import Navbar from '../components/Navbar';
import { FaCheckCircle, FaComments, FaStar, FaUsers, FaShieldAlt, FaRocket, FaChevronLeft, FaChevronRight, FaMapPin, FaWrench, FaHammer, FaBolt, FaPaintBrush, FaBook, FaStethoscope, FaDumbbell, FaBroom, FaTree, FaPaw, FaGraduationCap, FaTrophy, FaFireAlt, FaHeadphones, FaClipboardList, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope, FaMap, FaClock, FaSearch, FaCalendarAlt, FaQuoteLeft } from 'react-icons/fa';
import { categoryService, workerService, adminService } from '../services/endpoints';
import useEmblaCarousel from 'embla-carousel-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Worker images list - fallback for workers without profile images
const fallbackWorkerImages = [
  '/images/workers/two-nepalese-carpenters-working-in-village-workshop-bungamati-kathmandu-A03TXF.jpg',
  '/images/workers/nepalese-men-working-at-the-restauration-of-the-city-of-bhaktapur-JT1GEJ.jpg',
  '/images/workers/worker-carrying-heavy-load-kathmandu-15238609.webp',
  '/images/workers/Nepalese-workers-working-at-a-construction-site-in-Kathmandu-Nepal.-3-image-pasal-2023-09-10.jpg',
  '/images/workers/i07d1PO.jpg',
  '/images/workers/kathmandu-nepal-august-26-2018-260nw-1164516670.webp',
  '/images/workers/images.jpeg',
  '/images/workers/images_couceller.jpeg',
  '/images/workers/images_therapist.jpeg',
  '/images/workers/gettyimages-628350148-612x612.jpg',
  '/images/workers/0714 NEPAL.jpg',
  '/images/workers/3508l300p-1-WKZlP2T0UDGXI73WtZ3hGQ8hPMrnHSKDIpVhioTv.jpg',
  '/images/workers/67972273988f1c198cae895d.webp',
];

// Function to get image for worker - prefer worker's profile image, fallback to random
const getWorkerImage = (worker, index) => {
  // Use worker's profile image if available
  if (worker.image) {
    return worker.image;
  }
  // Fallback to random image from list if no profile image
  return fallbackWorkerImages[index % fallbackWorkerImages.length];
};

// Category images mapping
const categoryImages = {
  1: '/images/workers/two-nepalese-carpenters-working-in-village-workshop-bungamati-kathmandu-A03TXF.jpg',
  2: '/images/workers/nepalese-men-working-at-the-restauration-of-the-city-of-bhaktapur-JT1GEJ.jpg',
  3: '/images/workers/gettyimages-628350148-612x612.jpg',
  4: '/images/workers/0714 NEPAL.jpg',
  5: '/images/workers/images_couceller.jpeg',
};

// Category icons mapping
const categoryIcons = {
  1: <FaWrench size={28} />,
  2: <FaHammer size={28} />,
  3: <FaBolt size={28} />,
  4: <FaPaintBrush size={28} />,
  5: <FaBook size={28} />,
  6: <FaStethoscope size={28} />,
  7: <FaDumbbell size={28} />,
  8: <FaBroom size={28} />,
  9: <FaTree size={28} />,
  10: <FaPaw size={28} />,
};

const Landing = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoryWorkers, setCategoryWorkers] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [testimonials, setTestimonials] = useState([]);



  // Fetch categories and workers on mount
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      offset: 100,
    });

    const fetchData = async () => {
      try {
        const categoriesRes = await categoryService.getAllCategories();
        const cats = (categoriesRes.data && Array.isArray(categoriesRes.data)) ? categoriesRes.data : (Array.isArray(categoriesRes) ? categoriesRes : []);

        if (cats.length > 0) {
          setCategories(cats);
          setSelectedCategoryId(cats[0].id);

          try {
            const workersRes = await workerService.getAllWorkers({ service_id: cats[0].id, limit: 10 });
            const workers = (workersRes.data && workersRes.data.data) ? workersRes.data.data : (workersRes.data || []);
            setCategoryWorkers(prev => ({ ...prev, [cats[0].id]: workers || [] }));
          } catch (err) {
            console.log('Workers fetch error:', err);
            setCategoryWorkers(prev => ({ ...prev, [cats[0].id]: [] }));
          }
        }
      } catch (err) {
        console.log('Categories fetch error:', err);
        setCategories([]);
        setCategoryWorkers({});
      }
    };

    fetchData();
  }, []);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const testimonialsRes = await adminService.getTestimonials();
        const testimonialsList = testimonialsRes.data.data || [];
        
        // Filter only visible testimonials
        const visibleTestimonials = testimonialsList.filter(t => t.is_visible || t.visible);
        setTestimonials(visibleTestimonials);
      } catch (err) {
        console.log('Testimonials fetch error:', err);
        setTestimonials([]);
      }
    };

    fetchTestimonials();
  }, []);

  // Fetch workers for selected category
  useEffect(() => {
    if (selectedCategoryId && !categoryWorkers[selectedCategoryId]) {
      const fetchWorkers = async () => {
        try {
          const workersRes = await workerService.getAllWorkers({ service_id: selectedCategoryId, limit: 10 });
          const workers = (workersRes.data && workersRes.data.data) ? workersRes.data.data : (workersRes.data || []);
          setCategoryWorkers(prev => ({ ...prev, [selectedCategoryId]: workers || [] }));
        } catch (err) {
          console.log('Workers fetch error:', err);
          setCategoryWorkers(prev => ({ ...prev, [selectedCategoryId]: [] }));
        }
      };

      fetchWorkers();
    }
  }, [selectedCategoryId, categoryWorkers]);

  // Workers Carousel Component
  const WorkersCarousel = ({ categoryId }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
    const [prevEnabled, setPrevEnabled] = useState(false);
    const [nextEnabled, setNextEnabled] = useState(false);
    const workers = categoryWorkers[categoryId] || [];

    const onSelect = () => {
      setPrevEnabled(emblaApi?.canScrollPrev?.() ?? false);
      setNextEnabled(emblaApi?.canScrollNext?.() ?? false);
    };

    useEffect(() => {
      if (!emblaApi) return;
      onSelect();
      emblaApi.on('select', onSelect);
      emblaApi.on('reInit', onSelect);
    }, [emblaApi]);

    // Auto-scroll effect
    useEffect(() => {
      if (!emblaApi) return;

      const autoScroll = setInterval(() => {
        emblaApi.scrollNext();
      }, 5000); // 5 seconds

      return () => clearInterval(autoScroll);
    }, [emblaApi]);

    return (
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {workers.map((worker, index) => (
              <div key={worker.id} className="flex-shrink-0 w-full sm:w-80">
                <div
                  onClick={() => navigate(`/workers/${worker.id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                >
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    <img
                      src={getWorkerImage(worker, index)}
                      alt={worker.name || `${worker.first_name} ${worker.last_name}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => { e.target.src = '/images/workers/gettyimages-628350148-612x612.jpg'; }}
                    />
                    <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full">
                      <span className="text-amber-600 text-sm font-bold">★ {worker.average_rating ? parseFloat(worker.average_rating).toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-neutral-800 mb-1">{worker.name || `${worker.first_name} ${worker.last_name}`}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <FaMapPin className="text-orange-600" size={11} /> {worker.location || 'Nepal'}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{worker.bio || 'Professional services'}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">

                      {/* Hourly Rate */}
                      <div className="rounded-xl border border-gray-200 bg-white p-3 flex flex-col items-start shadow-sm">
                        <span className="text-gray-500 text-xs">Hourly Rate</span>
                        <span className="text-lg font-semibold text-gray-900">
                          Rs{worker.hourly_rate}
                          <span className="text-xs font-normal text-gray-500 ml-1">/hr</span>
                        </span>
                      </div>

                      {/* Experience */}
                      <div className="rounded-xl border border-gray-200 bg-white p-3 flex flex-col items-start shadow-sm">
                        <span className="text-gray-500 text-xs">Experience</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {worker.experience_years || 0}+
                          <span className="text-xs font-normal text-gray-500 ml-1">yrs</span>
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {workers.length > 0 && (
          <>
            <button
              onClick={() => emblaApi?.scrollPrev?.()}
              disabled={!prevEnabled}
              className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all"
              style={prevEnabled ? { background: '#d97706', color: 'white' } : { background: '#e5e7eb', color: '#d1d5db' }}
            >
              <FaChevronLeft size={20} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext?.()}
              disabled={!nextEnabled}
              className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all"
              style={nextEnabled ? { background: '#d97706', color: 'white' } : { background: '#e5e7eb', color: '#d1d5db' }}
            >
              <FaChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    );
  };

  // CountUp Component with animation
  const CountUpCard = ({ end, suffix, label }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = React.useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      }, { threshold: 0.5 });

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => {
        if (cardRef.current) {
          observer.unobserve(cardRef.current);
        }
      };
    }, [isVisible]);

    useEffect(() => {
      if (!isVisible) return;

      let currentCount = 0;
      const increment = end / 50; // 50 steps for smooth animation
      const timer = setInterval(() => {
        currentCount += increment;
        if (currentCount >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(currentCount));
        }
      }, 30);

      return () => clearInterval(timer);
    }, [isVisible, end]);

    return (
      <div ref={cardRef} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
        <div className="text-4xl md:text-5xl font-black" style={{ color: '#d97706' }}>
          {Math.floor(count)}{suffix}
        </div>
        <div className="text-gray-600 text-sm mt-2 font-medium">{label}</div>
      </div>
    );
  };
  const CategoryCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
    const [prevEnabled, setPrevEnabled] = useState(false);
    const [nextEnabled, setNextEnabled] = useState(false);

    const onSelect = () => {
      setPrevEnabled(emblaApi?.canScrollPrev?.() ?? false);
      setNextEnabled(emblaApi?.canScrollNext?.() ?? false);
    };

    useEffect(() => {
      if (!emblaApi) return;
      onSelect();
      emblaApi.on('select', onSelect);
      emblaApi.on('reInit', onSelect);
    }, [emblaApi]);

    // Auto-scroll effect
    useEffect(() => {
      if (!emblaApi) return;

      const autoScroll = setInterval(() => {
        emblaApi.scrollNext();
      }, 4000); // 4 seconds

      return () => clearInterval(autoScroll);
    }, [emblaApi]);

    return (
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {categories.map(category => (
              <div key={category.id} className="flex-shrink-0 w-auto mr-10">
                <div
                  onClick={() => setSelectedCategoryId(category.id)}
                  className="px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 group flex items-center gap-3 border"
                  style={{
                    background: selectedCategoryId === category.id
                      ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 242, 245, 0.8) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderColor: selectedCategoryId === category.id ? '#d97706' : '#e5e7eb',
                    boxShadow: selectedCategoryId === category.id ? '0 4px 12px rgba(217, 119, 6, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transform: selectedCategoryId === category.id ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <div
                    className="text-white/80 group-hover:text-white transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{
                      background: selectedCategoryId === category.id
                        ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      color: selectedCategoryId === category.id ? 'white' : '#6b7280',
                    }}
                  >
                    {categoryIcons[category.id] || <FaWrench size={20} />}
                  </div>
                  <span 
                    className="font-semibold group-hover:text-neutral-900 transition-colors whitespace-nowrap text-sm md:text-base" 
                    style={{ color: selectedCategoryId === category.id ? '#d97706' : '#374151' }}
                  >
                    {category.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {categories.length > 6 && (
          <>
            <button
              onClick={() => emblaApi?.scrollPrev?.()}
              disabled={!prevEnabled}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all"
              style={prevEnabled ? { background: 'white', color: '#d97706', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)' } : { background: '#f3f4f6', color: '#d1d5db', backdropFilter: 'blur(10px)' }}
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext?.()}
              disabled={!nextEnabled}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all"
              style={nextEnabled ? { background: 'white', color: '#d97706', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)' } : { background: '#f3f4f6', color: '#d1d5db', backdropFilter: 'blur(10px)' }}
            >
              <FaChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div style={{ background: '#faf5f0', minHeight: '100vh' }}>
        {/* Hero Section - Modern & Playful */}
        <div className="pt-32 pb-20 px-4 relative overflow-hidden">
          {/* Modern gradient background */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 25%, #fff9f0 50%, #fff5e6 75%, #ffeee0 100%)',
            }}
          ></div>
          
          {/* Floating animated shapes */}
          <div className="absolute top-20 right-5 w-32 h-32 rounded-full opacity-30 z-0 animate-pulse" style={{ background: '#d97706', filter: 'blur(40px)' }}></div>
          <div className="absolute bottom-32 left-5 w-48 h-48 rounded-full opacity-20 z-0" style={{ background: '#f59e0b', filter: 'blur(60px)', animation: 'float 6s ease-in-out infinite' }}></div>
          <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full opacity-15 z-0" style={{ background: '#d97706', filter: 'blur(50px)' }}></div>
          
          {/* Main content */}
          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Badge */}
            <div className="mb-8 inline-block" data-aos="fade-down">
              <span className="inline-block px-5 py-3 rounded-full text-sm font-bold" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', border: '2px solid rgba(217, 119, 6, 0.3)' }}>
                ✨ Nepal's Trusted Professionals Marketplace
              </span>
            </div>
            
            {/* Main heading with visual hierarchy */}
            <h1 className="text-7xl md:text-8xl font-black text-neutral-900 mb-6 leading-tight" data-aos="fade-up" data-aos-delay="100">
              Find Your
              <br />
              <span className="relative inline-block" style={{ color: '#d97706' }}>
                Perfect
                <span className="absolute -top-8 -right-8 text-5xl animate-bounce">⚡</span>
              </span>
              <br />
              Professional
            </h1>
            
            {/* Descriptive subheading */}
            <p className="text-xl md:text-2xl text-neutral-700 mb-4 max-w-3xl mx-auto font-light leading-relaxed" data-aos="fade-up" data-aos-delay="200">
              Connect with vetted, skilled professionals across Nepal. <span style={{ color: '#d97706', fontWeight: 600 }}>From plumbing to teaching</span>, find experts you can trust for quality work.
            </p>
            
            {/* Secondary message */}
            <p className="text-lg text-neutral-600 mb-12 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="300">
              Thousands of verified professionals ready to transform your space
            </p>

            {/* CTA Buttons with enhanced styling */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20" data-aos="fade-up" data-aos-delay="400">
              {!user ? (
                <>
                  <button
                    onClick={() => navigate('/register?role=client')}
                    className="text-white font-bold py-5 px-12 rounded-lg transform hover:scale-105 transition-all hover:shadow-2xl shadow-xl text-lg relative group overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                       Discover Talent
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: '#000' }}></div>
                  </button>
                  <button
                    onClick={() => navigate('/register?role=worker')}
                    className="font-bold py-5 px-12 rounded-lg transform hover:scale-105 transition-all border-3 shadow-lg hover:shadow-xl text-lg"
                    style={{ borderColor: '#d97706', color: '#d97706', background: 'white' }}
                  >
                     Offer Your Skills
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/workers')}
                  className="text-white font-bold py-5 px-12 rounded-lg transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl text-lg"
                  style={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' }}
                >
                  🚀 Browse Professionals
                </button>
              )}
            </div>

            {/* Stats Cards with improved design */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12" data-aos="fade-up" data-aos-delay="500">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style={{ borderTop: '4px solid #d97706' }}>
                <div data-aos="fade-up" data-aos-delay="0">
                  <CountUpCard end={500} suffix="+" label="Verified Professionals" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style={{ borderTop: '4px solid #d97706' }}>
                <div data-aos="fade-up" data-aos-delay="100">
                  <CountUpCard end={2500} suffix="+" label="Happy Clients" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105" style={{ borderTop: '4px solid #d97706' }}>
                <div data-aos="fade-up" data-aos-delay="200">
                  <CountUpCard end={98} suffix="%" label="Satisfaction Rate" />
                </div>
              </div>
            </div> */}

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 justify-center mt-16" data-aos="fade-up" data-aos-delay="600">
              <div className="flex items-center gap-2">
                {/* <span className="text-2xl">🔒</span> */}
                <span className="text-sm text-neutral-700">Secure & Verified</span>
              </div>
              <div className="flex items-center gap-2">
                {/* <span className="text-2xl">⭐</span> */}
                <span className="text-sm text-neutral-700">Highly Rated</span>
              </div>
              <div className="flex items-center gap-2">
                {/* <span className="text-2xl">🚀</span> */}
                <span className="text-sm text-neutral-700">Quick Response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Carousel */}
        <div
          className="relative py-20 md:py-32 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
          }}
        >
          {/* Decorative background shapes - subtle */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-orange-100/30 rounded-full -translate-x-40 -translate-y-40" style={{ filter: 'blur(80px)' }}></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-50/40 rounded-full translate-x-40 translate-y-40" style={{ filter: 'blur(80px)' }}></div>

          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-800 mb-3 text-center">Available Jobs</h2>
            <p className="text-center text-neutral-600 mb-16 text-lg">Apply on any job matching your skills</p>
            <CategoryCarousel />
          </div>
        </div>

        {/* Browse by Service */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Workers Carousel */}
          {selectedCategoryId && (
            <div className="px-0 md:px-12" data-aos="fade-up">
              <WorkersCarousel categoryId={selectedCategoryId} />
            </div>
          )}
        </div>

        {/* About the Platform Section */}
        <div className="py-20 px-4" style={{ background: '#ffffff' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Description */}
              <div className="space-y-6">
                <div>
                  <img 
                    src="/images/logo/logo.png" 
                    alt="Sallah Sanjal" 
                    className="h-16 w-auto object-contain mb-4"
                  />
                  <p className="text-lg text-neutral-600">Connecting skilled professionals with opportunities across Nepal</p>
                </div>

                <p className="text-neutral-700 leading-relaxed">
                  Sallah Sanjal is your trusted marketplace for finding the best talent. Whether you need plumbers, carpenters, electricians, or specialized professionals, we connect you with vetted experts ready to work.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4" data-aos="fade-right" data-aos-delay="0">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md" style={{ background: '#d97706' }}>
                        <FaCheckCircle className="text-white" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800">Verified Professionals</h3>
                      <p className="text-sm text-neutral-600">All workers are vetted and rated by clients</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4" data-aos="fade-right" data-aos-delay="100">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md" style={{ background: '#d97706' }}>
                        <FaStar className="text-white" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800">Quality Assured</h3>
                      <p className="text-sm text-neutral-600">Find professionals with proven track records</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4" data-aos="fade-right" data-aos-delay="200">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md" style={{ background: '#d97706' }}>
                        <FaRocket className="text-white" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800">Fast & Reliable</h3>
                      <p className="text-sm text-neutral-600">Get work done quickly by trusted experts</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/workers')}
                  className="text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all hover:shadow-lg mt-6"
                  style={{ background: '#d97706' }}
                >
                  Start Browsing →
                </button>
              </div>

              {/* Right Column - Website Mockup */}
              <div className="flex justify-center">
                <div
                  className="rounded-2xl overflow-hidden shadow-2xl border-8 border-gray-800 bg-gray-800"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    aspectRatio: '9/16',
                    backgroundImage: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)',
                  }}
                >
                  <div className="p-4 h-full flex flex-col overflow-hidden bg-white/90 backdrop-blur">
                    {/* Mock Phone Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-neutral-600">Sallah Sanjal</span>
                      <span className="text-xs text-neutral-500">App Preview</span>
                    </div>

                    {/* Mock Content */}
                    <div className="flex-1 space-y-4 overflow-y-auto">
                      {/* Mock Search */}
                      <div className="bg-gray-100 h-10 rounded-lg animate-pulse"></div>

                      {/* Mock Categories */}
                      <div className="space-y-3">
                        <div className="h-6 w-24 bg-gradient-to-r from-orange-200 to-orange-100 rounded animate-pulse"></div>
                        <div className="flex gap-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 w-12 bg-gradient-to-br from-orange-300 to-orange-200 rounded-xl animate-pulse"></div>
                          ))}
                        </div>
                      </div>

                      {/* Mock Workers */}
                      <div className="space-y-3">
                        {[1, 2].map(i => (
                          <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-100 rounded mb-2 animate-pulse"></div>
                            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-2"></div>
                            <div className="h-3 w-32 bg-gray-50 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mock Phone Footer */}
                    <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-200">
                      <div className="h-6 w-6 rounded-full bg-orange-300 animate-pulse"></div>
                      <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5f0 100%)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-800 mb-4 text-center">How It Works</h2>
            <p className="text-center text-neutral-600 mb-16 max-w-2xl mx-auto">Simple steps to connect with the perfect professional for your needs</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: <FaSearch size={40} />, title: 'Browse', description: 'Explore hundreds of verified professionals in your area' },
                { icon: <FaCheckCircle size={40} />, title: 'Select', description: 'Compare profiles, ratings, and choose the best fit' },
                { icon: <FaCalendarAlt size={40} />, title: 'Book', description: 'Schedule a time that works for you' },
                { icon: <FaStar size={40} />, title: 'Enjoy', description: 'Sit back and enjoy quality work from experts' },
              ].map((step, index) => (
                <div key={index} className="relative" data-aos="fade-up" data-aos-delay={index * 100}>
                  {/* Connector line */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-20 left-1/2 w-full h-1" style={{ background: 'linear-gradient(to right, #d97706, transparent)' }}></div>
                  )}

                  {/* Step Card */}
                  <div className="relative z-10 bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                    {/* Step Number */}
                    <div
                      className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: '#d97706' }}
                    >
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className="mb-6 flex justify-center" style={{ color: '#d97706' }}>
                      {step.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-neutral-800 mb-3 text-center">{step.title}</h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm text-center leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-20 px-4" style={{ background: '#faf5f0' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-800 mb-4 text-center">What Our Users Say</h2>
            <p className="text-center text-neutral-600 mb-16 max-w-2xl mx-auto">Join thousands of satisfied clients and professionals</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.length > 0 ? (
                testimonials.map((testimonial, index) => {
                  // Get initials from user name or default
                  const firstName = testimonial.authorFirstName || testimonial.first_name || 'User';
                  const lastName = testimonial.authorLastName || testimonial.last_name || '';
                  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
                  
                  return (
                    <div key={index} className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all" data-aos="fade-up" data-aos-delay={index * 100}>
                      {/* Quote Icon */}
                      <div className="mb-4" style={{ color: '#d97706' }}>
                        <FaQuoteLeft size={28} />
                      </div>

                      {/* Text */}
                      <p className="text-gray-700 mb-6 text-sm leading-relaxed italic">"{testimonial.content || testimonial.text}"</p>

                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <FaStar key={i} size={16} style={{ color: '#d97706' }} />
                        ))}
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ background: '#d97706' }}
                        >
                          {initials}
                        </div>

                        {/* Info */}
                        <div>
                          <h4 className="font-bold text-neutral-800">{firstName} {lastName}</h4>
                          <p className="text-xs text-gray-500">{testimonial.userRole || 'User'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No testimonials available yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white border-t border-gray-300 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              {[
                { icon: <FaUsers size={40} />, label: 'Jobs For Women', color: '#d97706' },
                { icon: <FaTrophy size={40} />, label: 'Top Experience Jobs', color: '#d97706' },
                { icon: <FaFireAlt size={40} />, label: 'Urgent Jobs', color: '#d97706' },
                { icon: <FaHeadphones size={40} />, label: 'Listen to Suggestions', color: '#d97706' },
                { icon: <FaGraduationCap size={40} />, label: 'Trainings', color: '#d97706' },
              ].map((item, i) => (
                <div key={i} className="text-center hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="mb-3 flex justify-center" style={{ color: '#d97706' }}>
                    {item.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modern Footer */}
        <footer className="bg-neutral-900 text-gray-300">
          {/* Main Footer Content */}
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Branding Column */}
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
                  <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <FaFacebook size={20} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <FaTwitter size={20} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <FaInstagram size={20} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <FaLinkedin size={20} />
                  </a>
                </div>
              </div>

              {/* For Clients */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">For Clients</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Browse Professionals</a></li>
                  <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">How It Works</a></li>
                  <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Categories</a></li>
                  <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Reviews & Ratings</a></li>
                  <li><a href="#" className="text-gray-400 text-sm hover:text-orange-500 transition-colors">Pricing</a></li>
                </ul>
              </div>

              {/* For Professionals */}
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

              {/* Contact & Info */}
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
                      <p className="text-sm text-gray-300">9 AM - 6 PM (IST)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="border-t border-gray-700 pt-12 mb-12">
              <div className="max-w-2xl mx-auto text-center mb-8">
                <h4 className="text-xl font-bold text-white mb-2">Subscribe to Our Newsletter</h4>
                <p className="text-gray-400 text-sm mb-6">Get exclusive deals, job updates, and professional tips directly to your inbox</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
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

            {/* Footer Bottom */}
            <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                <p>&copy; 2026 Sallah Sanjal. All rights reserved.</p>
              </div>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Cookie Policy</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Sitemap</a>
              </div>
            </div>
          </div>

          {/* Decorative top border */}
          <div
            className="h-1 bg-gradient-to-r"
            style={{ background: 'linear-gradient(to right, #d97706, transparent, #d97706)' }}
          ></div>
        </footer>
      </div>
    </>
  );
};

export default Landing;

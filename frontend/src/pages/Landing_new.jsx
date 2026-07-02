// Alternative landing page with worker/category carousel and stats

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store';
import Navbar from '../components/Navbar';
import { FaCheckCircle, FaComments, FaStar, FaUsers, FaShieldAlt, FaRocket, FaChevronLeft, FaChevronRight, FaMapPin } from 'react-icons/fa';
import { categoryService, workerService } from '../services/endpoints';
import useEmblaCarousel from 'embla-carousel-react';

// Worker images mapping
const workerImages = {
  1: '/images/workers/two-nepalese-carpenters-working-in-village-workshop-bungamati-kathmandu-A03TXF.jpg',
  2: '/images/workers/nepalese-men-working-at-the-restauration-of-the-city-of-bhaktapur-JT1GEJ.jpg',
  3: '/images/workers/worker-carrying-heavy-load-kathmandu-15238609.webp',
  4: '/images/workers/Nepalese-workers-working-at-a-construction-site-in-Kathmandu-Nepal.-3-image-pasal-2023-09-10.jpg',
  5: '/images/workers/i07d1PO.jpg',
  6: '/images/workers/kathmandu-nepal-august-26-2018-260nw-1164516670.webp',
  7: '/images/workers/images.jpeg',
  8: '/images/workers/images_couceller.jpeg',
  9: '/images/workers/images_therapist.jpeg',
};

// Category images mapping
const categoryImages = {
  1: '/images/workers/two-nepalese-carpenters-working-in-village-workshop-bungamati-kathmandu-A03TXF.jpg',
  2: '/images/workers/nepalese-men-working-at-the-restauration-of-the-city-of-bhaktapur-JT1GEJ.jpg',
  3: '/images/workers/gettyimages-628350148-612x612.jpg',
  4: '/images/workers/0714 NEPAL.jpg',
  5: '/images/workers/images_couceller.jpeg',
};

const Landing = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoryWorkers, setCategoryWorkers] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Static fallback data
  const staticCategories = [
    { id: 1, name: 'Plumbing', description: 'Plumbing services' },
    { id: 2, name: 'Carpentry', description: 'Carpentry & woodwork' },
    { id: 3, name: 'Electrical', description: 'Electrical work' },
    { id: 4, name: 'Painting', description: 'Painting services' },
    { id: 5, name: 'Tutoring', description: 'Educational services' },
  ];

  const staticWorkers = {
    1: [
      { id: 1, name: 'Ramesh Kumar', bio: 'Expert plumber with 8+ years experience', hourly_rate: 500, average_rating: 4.8, experience_years: 8, location: 'Kathmandu' },
      { id: 2, name: 'Deepak Singh', bio: 'Fast and reliable plumbing services', hourly_rate: 450, average_rating: 4.6, experience_years: 6, location: 'Bhaktapur' },
      { id: 3, name: 'Suresh Thapa', bio: 'Emergency plumbing specialist', hourly_rate: 550, average_rating: 4.9, experience_years: 10, location: 'Lalitpur' },
      { id: 4, name: 'Anil Sharma', bio: 'Professional plumber', hourly_rate: 480, average_rating: 4.7, experience_years: 7, location: 'Kathmandu' },
      { id: 5, name: 'Roshan Gurung', bio: 'Reliable plumbing expert', hourly_rate: 520, average_rating: 4.8, experience_years: 8, location: 'Bhaktapur' },
      { id: 6, name: 'Govind Yadav', bio: 'Modern plumbing solutions', hourly_rate: 500, average_rating: 4.5, experience_years: 5, location: 'Kathmandu' },
    ],
    2: [
      { id: 7, name: 'Vikram Patel', bio: 'Fine carpentry and woodwork', hourly_rate: 600, average_rating: 4.7, experience_years: 9, location: 'Kathmandu' },
      { id: 8, name: 'Naveen Kumar', bio: 'Custom furniture and repairs', hourly_rate: 550, average_rating: 4.8, experience_years: 7, location: 'Bhaktapur' },
      { id: 9, name: 'Sandeep Rao', bio: 'Modern carpentry solutions', hourly_rate: 500, average_rating: 4.5, experience_years: 5, location: 'Kathmandu' },
    ],
    3: [
      { id: 1, name: 'Vikram Patel', bio: 'Certified electrician for all needs', hourly_rate: 400, average_rating: 4.9, experience_years: 11, location: 'Kathmandu' },
      { id: 2, name: 'Naveen Kumar', bio: 'Industrial & residential electrical work', hourly_rate: 450, average_rating: 4.7, experience_years: 8, location: 'Bhaktapur' },
      { id: 3, name: 'Sandeep Rao', bio: 'Advanced electrical systems specialist', hourly_rate: 480, average_rating: 4.6, experience_years: 6, location: 'Lalitpur' },
    ],
    4: [
      { id: 4, name: 'Ramesh Kumar', bio: 'Professional painter with quality work', hourly_rate: 350, average_rating: 4.7, experience_years: 7, location: 'Kathmandu' },
      { id: 5, name: 'Deepak Singh', bio: 'Interior & exterior painting expert', hourly_rate: 400, average_rating: 4.8, experience_years: 8, location: 'Bhaktapur' },
    ],
    5: [
      { id: 6, name: 'Priya Sharma', bio: 'Mathematics & Science tutor', hourly_rate: 300, average_rating: 4.9, experience_years: 6, location: 'Kathmandu' },
      { id: 7, name: 'Arun Thapa', bio: 'English language specialist', hourly_rate: 280, average_rating: 4.6, experience_years: 5, location: 'Bhaktapur' },
    ],
  };

  // Fetch categories and workers on mount
  useEffect(() => {
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
            setCategoryWorkers(prev => ({ ...prev, [cats[0].id]: workers.length > 0 ? workers : staticWorkers[cats[0].id] || [] }));
          } catch (err) {
            console.log('Workers fetch error:', err);
            setCategoryWorkers(prev => ({ ...prev, [cats[0].id]: staticWorkers[cats[0].id] || [] }));
          }
        } else {
          setCategories(staticCategories);
          setSelectedCategoryId(staticCategories[0].id);
          setCategoryWorkers(prev => ({ ...prev, [staticCategories[0].id]: staticWorkers[staticCategories[0].id] || [] }));
        }
      } catch (err) {
        console.log('Categories fetch error:', err);
        setCategories(staticCategories);
        setSelectedCategoryId(staticCategories[0].id);
        setCategoryWorkers(prev => ({ ...prev, [staticCategories[0].id]: staticWorkers[staticCategories[0].id] || [] }));
      }
    };
    
    fetchData();
  }, []);

  // Fetch workers for selected category
  useEffect(() => {
    if (selectedCategoryId && !categoryWorkers[selectedCategoryId]) {
      const fetchWorkers = async () => {
        try {
          const workersRes = await workerService.getAllWorkers({ service_id: selectedCategoryId, limit: 10 });
          const workers = (workersRes.data && workersRes.data.data) ? workersRes.data.data : (workersRes.data || []);
          setCategoryWorkers(prev => ({ ...prev, [selectedCategoryId]: workers.length > 0 ? workers : staticWorkers[selectedCategoryId] || [] }));
        } catch (err) {
          console.log('Workers fetch error:', err);
          setCategoryWorkers(prev => ({ ...prev, [selectedCategoryId]: staticWorkers[selectedCategoryId] || [] }));
        }
      };
      
      fetchWorkers();
    }
  }, [selectedCategoryId, categoryWorkers]);

  // Workers Carousel Component
  const WorkersCarousel = ({ categoryId }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
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

    return (
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {workers.map(worker => (
              <div key={worker.id} className="flex-shrink-0 w-full sm:w-80">
                <div 
                  onClick={() => navigate(`/worker/${worker.id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                >
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    <img 
                      src={workerImages[worker.id] || '/images/workers/gettyimages-628350148-612x612.jpg'} 
                      alt={worker.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full">
                      <span className="text-amber-600 text-sm font-bold">★ {worker.average_rating?.toFixed(1) ?? 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-neutral-800 mb-1">{worker.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <FaMapPin className="text-orange-600" size={11} /> {worker.location || 'Nepal'}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{worker.bio}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      <div className="bg-orange-50 rounded p-2.5 text-center border-l-4 border-orange-600">
                        <div className="font-bold text-orange-700">₹{worker.hourly_rate}</div>
                        <div className="text-gray-600 text-xs">per hour</div>
                      </div>
                      <div className="bg-blue-50 rounded p-2.5 text-center border-l-4 border-blue-600">
                        <div className="font-bold text-blue-700">{worker.experience_years || 0}+</div>
                        <div className="text-gray-600 text-xs">years</div>
                      </div>
                    </div>

                    <button 
                      className="w-full py-2 rounded-lg font-semibold text-white text-sm transition-all hover:scale-105"
                      style={{ background: '#d97706' }}
                    >
                      View Profile
                    </button>
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all"
              style={prevEnabled ? { background: '#d97706', color: 'white' } : { background: '#e5e7eb', color: '#d1d5db' }}
            >
              <FaChevronLeft size={20} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext?.()}
              disabled={!nextEnabled}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all"
              style={nextEnabled ? { background: '#d97706', color: 'white' } : { background: '#e5e7eb', color: '#d1d5db' }}
            >
              <FaChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    );
  };

  // Category Carousel Component
  const CategoryCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
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

    return (
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {categories.map(category => (
              <div key={category.id} className="flex-shrink-0 w-full sm:w-80">
                <div 
                  onClick={() => setSelectedCategoryId(category.id)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg cursor-pointer transition-all group h-full flex flex-col"
                >
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    <img 
                      src={categoryImages[category.id] || '/images/workers/gettyimages-628350148-612x612.jpg'} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-800 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description || 'Professional services'}</p>
                    </div>
                    <button 
                      className="px-4 py-2 rounded-lg font-semibold text-white text-sm w-fit transition-all hover:scale-105"
                      style={{ background: '#d97706' }}
                    >
                      Browse →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {categories.length > 4 && (
          <>
            <button
              onClick={() => emblaApi?.scrollPrev?.()}
              disabled={!prevEnabled}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all"
              style={prevEnabled ? { background: '#d97706', color: 'white' } : { background: '#e5e7eb', color: '#d1d5db' }}
            >
              <FaChevronLeft size={20} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext?.()}
              disabled={!nextEnabled}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all"
              style={nextEnabled ? { background: '#d97706', color: 'white' } : { background: '#e5e7eb', color: '#d1d5db' }}
            >
              <FaChevronRight size={20} />
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
        {/* Hero Section */}
        <div className="pt-24 pb-16 px-4" style={{ background: 'linear-gradient(135deg, #faf5f0 0%, #f5ede5 100%)' }}>
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-black text-neutral-800 mb-6">Find Your Ideal Candidates</h1>
            <p className="text-lg text-neutral-700 mb-12 max-w-3xl mx-auto">Discover the best talent. Find skilled professionals vetted for quality and trusted across Nepal. From plumbers to teachers, connect with reliable experts for your needs.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {!user ? (
                <>
                  <button
                    onClick={() => navigate('/register?role=client')}
                    className="text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all hover:shadow-lg"
                    style={{ background: '#d97706' }}
                  >
                    Discover Talent
                  </button>
                  <button
                    onClick={() => navigate('/register?role=worker')}
                    className="font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all border-2"
                    style={{ borderColor: '#d97706', color: '#d97706' }}
                  >
                    Offer Services
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/workers')}
                  className="text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all"
                  style={{ background: '#d97706' }}
                >
                  Browse Professionals
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold" style={{ color: '#d97706' }}>500+</div>
                <div className="text-gray-600 text-sm">Professionals</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold" style={{ color: '#d97706' }}>2.5k+</div>
                <div className="text-gray-600 text-sm">Happy Clients</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold" style={{ color: '#d97706' }}>98%</div>
                <div className="text-gray-600 text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="max-w-6xl mx-auto px-4 py-16 border-b border-gray-300">
          <h2 className="text-4xl font-bold text-neutral-800 mb-4 text-center">Available Jobs</h2>
          <p className="text-center text-neutral-600 mb-12">Apply on any job matching your skills</p>
          <CategoryCarousel />
        </div>

        {/* Browse by Service */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-neutral-800 mb-4 text-center">Browse by Service</h2>
          <p className="text-center text-neutral-600 mb-12">Find the perfect professional for your needs</p>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategoryId === cat.id
                    ? 'text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-600'
                }`}
                style={selectedCategoryId === cat.id ? { background: '#d97706' } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Workers Carousel */}
          {selectedCategoryId && (
            <div className="px-0 md:px-12">
              <WorkersCarousel categoryId={selectedCategoryId} />
            </div>
          )}
        </div>

        {/* Quick Links Section */}
        <div className="bg-white border-t border-gray-300 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              {[
                { icon: '👨‍💼', label: 'Jobs For Women', color: '#d97706' },
                { icon: '⭐', label: 'Top Experience Jobs', color: '#d97706' },
                { icon: '📋', label: 'Urgent Jobs', color: '#d97706' },
                { icon: '🎧', label: 'Listen to Suggestions', color: '#d97706' },
                { icon: '🎓', label: 'Trainings', color: '#d97706' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;

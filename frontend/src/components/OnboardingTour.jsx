import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarCheck, FaTachometerAlt, FaQuestionCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ONBOARDING_KEY = 'sallah_onboarding_complete';

const steps = [
  {
    title: 'Welcome to Sallah Sanjal!',
    icon: <FaSearch size={40} />,
    description: 'Your trusted marketplace for skilled professionals in Nepal. Let us show you around so you can get started right away!',
    color: '#d97706',
  },
  {
    title: 'Find the Right Professional',
    icon: <FaSearch size={40} />,
    description: 'Browse our verified professionals, filter by category, location, rating, or price. Read reviews and compare before making your choice.',
    color: '#5865f2',
  },
  {
    title: 'Book a Service',
    icon: <FaCalendarCheck size={40} />,
    description: 'Select your preferred professional, choose a date and time, describe your needs, and send a booking request. It is that simple!',
    color: '#10b981',
  },
  {
    title: 'Manage Everything from Dashboard',
    icon: <FaTachometerAlt size={40} />,
    description: 'Track your bookings, chat with professionals, manage payments, and update your profile all from one central dashboard.',
    color: '#a855f7',
  },
  {
    title: 'Need Help? We Are Here!',
    icon: <FaQuestionCircle size={40} />,
    description: 'Visit our Help & FAQ page for answers to common questions, or contact our support team anytime. We are always happy to assist!',
    color: '#d97706',
  },
];

const OnboardingTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding tour"
      aria-describedby="onboarding-desc"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
        style={{ animation: 'onboardingFadeIn 0.3s ease-out' }}
      >
        <div className="h-1.5 bg-neutral-100">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: step.color,
            }}
          />
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-neutral-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="flex gap-1.5" aria-hidden="true">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: idx === currentStep ? step.color : '#e5e7eb',
                    transform: idx === currentStep ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: `${step.color}15`, color: step.color }}
          >
            {step.icon}
          </div>

          <h2 className="text-2xl font-black text-neutral-800 text-center mb-3">{step.title}</h2>
          <p id="onboarding-desc" className="text-neutral-600 text-center leading-relaxed mb-8">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-neutral-700 transition-colors"
              aria-label="Skip the onboarding tour"
            >
              Skip tour
            </button>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-neutral-50"
                  style={{ borderColor: step.color, color: step.color }}
                >
                  <FaChevronLeft size={12} /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg"
                style={{ background: step.color }}
              >
                {currentStep < steps.length - 1 ? (
                  <>Next <FaChevronRight size={12} /></>
                ) : (
                  'Get Started!'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes onboardingFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingTour;

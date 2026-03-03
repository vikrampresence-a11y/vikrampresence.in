import React from 'react';
import { ChevronDown } from 'lucide-react';

const HeroSection = () => {
  const scrollToNext = () => {
    const nextSection = document.querySelector('#philosophy');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1696257835988-1a16b46842ed"
          alt="Cinematic black and white background representing clarity and focus"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto page-load">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight stagger-item">
            Stop Drifting.<br />Start Building.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed stagger-item">
            You're not lost. You're just stuck between who you were and who you're becoming. 
            This is where clarity meets action.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center stagger-item">
            <a
              href="#products"
              className="px-8 py-4 bg-white text-black font-semibold hover:bg-gray-200 transition-all duration-300 uppercase tracking-wider text-sm btn-primary"
            >
              Explore Products
            </a>
            <a
              href="#philosophy"
              className="px-8 py-4 border border-white text-white font-semibold hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wider text-sm"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white scroll-indicator cursor-pointer hover:text-gray-300 transition-colors"
        aria-label="Scroll to next section"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};

export default HeroSection;
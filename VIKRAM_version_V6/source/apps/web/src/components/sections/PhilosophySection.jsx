import React from 'react';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';

const PhilosophySection = () => {
  return (
    <section id="philosophy" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto">
            {/* Animated Divider */}
            <div className="mb-12">
              <img
                src="https://images.unsplash.com/photo-1677751591010-11f83a44577f"
                alt="Geometric divider pattern"
                className="w-full h-1 object-cover opacity-30"
              />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
              The Truth About Clarity
            </h2>
            
            <div className="space-y-8 text-gray-300 text-lg leading-relaxed">
              <p>
                You don't need more motivation. You don't need another guru telling you to "just believe." 
                What you need is clarity—the kind that cuts through the noise and shows you exactly what to do next.
              </p>
              
              <p>
                This isn't about quick fixes or empty promises. It's about building discipline when no one's watching. 
                It's about developing confidence through consistent action. It's about taking control of your life, 
                one honest decision at a time.
              </p>
              
              <p className="text-white font-semibold">
                Clarity isn't a destination. It's a practice.
              </p>
              
              <p>
                Every product here is designed to help you cut through confusion, build real skills, and create 
                sustainable change. No fluff. No hype. Just practical tools for people who are ready to do the work.
              </p>
            </div>

            {/* Animated Divider */}
            <div className="mt-12">
              <div className="animated-divider"></div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PhilosophySection;
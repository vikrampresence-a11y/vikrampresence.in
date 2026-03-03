
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    { text: "This clarity blueprint changed how I think. Simple and powerful.", name: "Raj Kumar" },
    { text: "Finally, a course that actually works. No fluff, just real value.", name: "Priya Singh" },
    { text: "The discipline bootcamp transformed my life. Highly recommend!", name: "Amit Patel" },
    { text: "Best investment I made. Clear, honest, and effective.", name: "Sarah Khan" },
    { text: "Confidence accelerator is exactly what I needed. Thank you!", name: "Vikram Sharma" },
    { text: "Simple English, powerful lessons. This is real education.", name: "Neha Gupta" },
    { text: "I recommend this to everyone. Life-changing content.", name: "Arjun Verma" },
    { text: "Worth every rupee. Clear thinking starts here.", name: "Anjali Desai" },
    { text: "The best part? No complicated words. Just pure value.", name: "Rohan Singh" },
    { text: "Transformed my mindset in 30 days. Incredible!", name: "Divya Nair" }
  ];

  useEffect(() => {
    // 6 seconds total per testimonial (matches the CSS animation duration)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-32 bg-black relative">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          Real Results
        </h2>

        <div className="relative h-56 max-w-2xl mx-auto flex items-center justify-center">
          {testimonials.map((testimonial, index) => (
            index === currentIndex && (
              <div
                key={`${index}-${currentIndex}`} // Force re-render to restart CSS animation
                className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] rounded-3xl p-8 animate-fade-in-out-fast animate-glow-pulse"
              >
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-[#FFD700] fill-[#FFD700]" size={20} />
                  ))}
                </div>
                <p className="text-lg md:text-2xl text-white font-light italic mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <p className="text-sm text-[#FFD700] font-bold uppercase tracking-widest">
                  - {testimonial.name}
                </p>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;


import React, { useState, useEffect } from 'react';

const TrustImagesLoop = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { url: "https://images.unsplash.com/photo-1610846859490-195abee6551f", alt: "Professional man teaching" },
    { url: "https://images.unsplash.com/photo-1674049405757-7cf913c53ffc", alt: "Woman on laptop" },
    { url: "https://images.unsplash.com/photo-1552581234-26160f608093", alt: "Group meeting" },
    { url: "https://images.unsplash.com/photo-1558967688-4356f23c8802", alt: "Celebrating success" },
    { url: "https://images.unsplash.com/photo-1538688554366-621d446302aa", alt: "Team collaboration" },
    { url: "https://images.unsplash.com/photo-1515615200917-f9623be1d8b0", alt: "Person learning" },
    { url: "https://images.unsplash.com/photo-1607615896122-6c919f897e55", alt: "Professional workspace" },
    { url: "https://images.unsplash.com/photo-1636369555100-e0ba574af653", alt: "Confident person" },
    { url: "https://images.unsplash.com/photo-1643917853949-74f4eba1c89b", alt: "Growth chart" },
    { url: "https://images.unsplash.com/photo-1651372381086-9861c9c81db5", alt: "Community network" }
  ];

  useEffect(() => {
    // 7 seconds total per image (matches the CSS animation duration)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden border-y border-white/5">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-16 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          Trusted by Thousands
        </h2>
        
        <div className="relative h-64 md:h-96 w-full max-w-[400px] mx-auto flex items-center justify-center">
          {images.map((image, index) => (
            index === currentIndex && (
              <img
                key={`${index}-${currentIndex}`} // Force re-render to restart CSS animation
                src={`${image.url}?auto=format&fit=crop&w=800&q=80`}
                alt={image.alt}
                className="absolute w-full h-full object-cover rounded-2xl animate-fade-in-out animate-glow-pulse"
              />
            )
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustImagesLoop;

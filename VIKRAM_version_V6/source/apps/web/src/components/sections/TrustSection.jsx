import React from 'react';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';

const TrustSection = () => {
  const stats = [
    { number: '10,000+', label: 'People Transformed' },
    { number: '4.9/5', label: 'Average Rating' },
    { number: '95%', label: 'Would Recommend' },
  ];

  const testimonials = [
    {
      id: 1,
      text: "I was stuck in analysis paralysis for months. This wasn't another motivational speech—it was a practical roadmap that actually worked.",
      author: 'Sarah M.',
      role: 'Marketing Professional',
    },
    {
      id: 2,
      text: "Finally, someone who speaks the truth without the fluff. The discipline guide changed how I approach every single day.",
      author: 'Marcus T.',
      role: 'Entrepreneur',
    },
    {
      id: 3,
      text: "I've tried countless self-help programs. This is different. It's honest, it's real, and it actually delivers results.",
      author: 'Jennifer L.',
      role: 'Software Engineer',
    },
  ];

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6">
        {/* Stats */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Testimonials */}
        <ScrollReveal delay={200}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
              Real People. Real Results.
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <ScrollReveal key={testimonial.id} delay={index * 100}>
                  <div className="glass-effect p-8 hover-lift">
                    <p className="text-gray-300 mb-6 leading-relaxed italic">
                      "{testimonial.text}"
                    </p>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-white font-semibold">{testimonial.author}</p>
                      <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Community Message */}
        <ScrollReveal delay={400}>
          <div className="max-w-3xl mx-auto text-center mt-20">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              This isn't just about products. It's about building a community of people who are done with excuses 
              and ready to create real change. People who understand that transformation isn't glamorous—it's 
              consistent, honest work.
            </p>
            <p className="text-white font-semibold text-xl">
              You're not alone in this journey.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TrustSection;
import React, { useState } from 'react';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';
import { useToast } from '@/components/ui/use-toast';

const CTASection = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 Email signup not implemented yet",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
    setEmail('');
  };

  return (
    <section id="contact" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start?
            </h2>
            
            <p className="text-gray-300 text-lg mb-12 leading-relaxed">
              Join thousands of people who are building clarity, discipline, and confidence. 
              Get weekly insights, exclusive content, and early access to new products.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-black font-semibold hover:bg-gray-200 transition-all duration-300 uppercase tracking-wider text-sm btn-primary whitespace-nowrap"
                >
                  Get Started
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                No spam. Unsubscribe anytime. Your email is safe with us.
              </p>
            </form>

            <div className="mt-16 pt-16 border-t border-white/10">
              <p className="text-gray-400 mb-4">Have questions? Want to connect?</p>
              <a
                href="mailto:hello@clarity.com"
                className="text-white hover:text-gray-300 transition-colors text-lg font-semibold"
              >
                hello@clarity.com
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
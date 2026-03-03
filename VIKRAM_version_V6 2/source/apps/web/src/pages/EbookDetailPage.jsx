import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';
import RazorpayCheckout from '@/components/features/RazorpayCheckout.jsx';

const EbookDetailPage = () => {
  const { id } = useParams();

  const toc = [
    'The Anatomy of Being Stuck',
    'Identifying Your Invisible Scripts',
    'The Framework of Subtraction',
    'Building the New Architecture',
    'Maintenance and Discipline',
  ];

  return (
    <>
      <Helmet>
        <title>{`Mental Architecture Vol ${id} | Vikram Presence`}</title>
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <ScrollReveal>
            <Link to="/ebooks" className="inline-flex items-center text-gray-400 hover:text-white text-sm uppercase tracking-widest mb-12 transition-colors group">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Library
            </Link>

            <div className="flex flex-col lg:flex-row gap-20">
              {/* Cover Image */}
              <div className="w-full lg:w-5/12">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative group">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80" 
                    alt={`Mental Architecture Vol. ${id} Cover`} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="w-full lg:w-7/12 flex flex-col justify-center">
                <div className="flex items-center space-x-4 mb-6">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs uppercase tracking-widest font-semibold border border-white/10">
                    Written Guide
                  </span>
                  <span className="text-gray-500 text-sm font-mono">Vol {id}</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter leading-tight">Mental Architecture</h1>
                
                <p className="text-xl text-gray-300 font-light leading-relaxed mb-12">
                  This isn't a book you just read; it's a manual you implement. We strip away the motivational fluff and give you the exact written frameworks needed to restructure your thought patterns and eliminate cognitive friction.
                </p>
                
                <div className="flex items-center space-x-8 mb-12 pb-12 border-b border-white/10">
                  <div className="text-4xl font-bold">₹299</div>
                  <RazorpayCheckout 
                    amount={299} 
                    productName={`Mental Architecture Vol ${id}`} 
                    buttonText="Purchase Access"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-8 flex items-center">
                    <BookOpen size={24} className="mr-3 text-gray-400" /> Table of Contents
                  </h3>
                  <ul className="space-y-6">
                    {toc.map((chapter, i) => (
                      <li key={i} className="flex items-start text-gray-300 font-light group">
                        <span className="text-white/40 mr-6 font-mono text-sm mt-1 group-hover:text-white transition-colors">
                          {(i+1).toString().padStart(2, '0')}
                        </span>
                        <span className="text-lg group-hover:text-white transition-colors">{chapter}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
};

export default EbookDetailPage;
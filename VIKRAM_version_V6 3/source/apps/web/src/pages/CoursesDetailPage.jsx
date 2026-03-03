import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PlayCircle, Clock, BarChart } from 'lucide-react';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';
import RazorpayCheckout from '@/components/features/RazorpayCheckout.jsx';

const CoursesDetailPage = () => {
  const { id } = useParams();

  const curriculum = [
    { module: 'Phase 1: The Foundation', lessons: ['Understanding the Fog', 'The Cost of Inaction', 'Setting the Baseline'] },
    { module: 'Phase 2: Deconstruction', lessons: ['Identifying Limiting Beliefs', 'The Audit Process', 'Cutting the Noise'] },
    { module: 'Phase 3: Reconstruction', lessons: ['Building the New Framework', 'Daily Disciplines', 'Protecting Your Focus'] },
  ];

  const outcomes = [
    'Identify and eliminate the root causes of mental paralysis.',
    'Develop a personalized framework for daily decision making.',
    'Build unshakeable discipline that doesn\'t rely on motivation.',
    'Regain control over your attention and focus.',
  ];

  return (
    <>
      <Helmet>
        <title>{`Masterclass ${id} | Vikram Presence`}</title>
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <ScrollReveal>
            <Link to="/courses" className="inline-flex items-center text-gray-400 hover:text-white text-sm uppercase tracking-widest mb-12 transition-colors group">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Programs
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Main Content */}
              <div className="lg:col-span-8">
                <div className="flex items-center space-x-4 mb-6">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs uppercase tracking-widest font-semibold border border-white/10">
                    Video Program
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter leading-tight">The Clarity Masterclass</h1>
                
                <p className="text-xl text-gray-300 mb-16 font-light leading-relaxed">
                  A comprehensive, immersive video program designed to completely overhaul your mental operating system. Stop drifting and start building with intention.
                </p>

                <div className="mb-20">
                  <h3 className="text-3xl font-bold mb-8 tracking-tight">The Outcomes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {outcomes.map((outcome, i) => (
                      <div key={i} className="flex items-start space-x-4 bg-white/5 p-6 rounded-xl border border-white/10">
                        <CheckCircle className="text-white shrink-0 mt-1" size={24} strokeWidth={1.5} />
                        <span className="text-gray-300 font-light leading-relaxed">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-bold mb-8 tracking-tight">Curriculum</h3>
                  <div className="space-y-6">
                    {curriculum.map((mod, i) => (
                      <div key={i} className="border border-white/10 bg-black rounded-xl p-8 hover:border-white/30 transition-colors">
                        <h4 className="text-xl font-bold mb-6 tracking-tight">{mod.module}</h4>
                        <ul className="space-y-4">
                          {mod.lessons.map((lesson, j) => (
                            <li key={j} className="flex items-center text-gray-400 font-light group cursor-pointer">
                              <PlayCircle size={20} className="mr-4 text-gray-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
                              <span className="group-hover:text-white transition-colors">{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky Sidebar */}
              <div className="lg:col-span-4">
                <div className="border border-white/20 bg-black rounded-2xl p-8 sticky top-32 shadow-2xl">
                  <div className="text-5xl font-bold mb-4 tracking-tighter">₹1999</div>
                  <p className="text-gray-400 text-sm mb-10 font-light">Lifetime access. 30-day guarantee.</p>
                  
                  <div className="mb-10">
                    <RazorpayCheckout 
                      amount={1999} 
                      productName={`The Clarity Masterclass ${id}`} 
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-6 text-sm text-gray-300 font-light">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="flex items-center"><Clock size={18} className="mr-3 text-gray-500" /> Duration</span>
                      <span className="font-medium text-white">6 Hours</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="flex items-center"><BarChart size={18} className="mr-3 text-gray-500" /> Level</span>
                      <span className="font-medium text-white">All Levels</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="flex items-center"><PlayCircle size={18} className="mr-3 text-gray-500" /> Format</span>
                      <span className="font-medium text-white">Video + Workbooks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
};

export default CoursesDetailPage;
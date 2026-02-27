import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, PlayCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const handleEnroll = () => {
    toast({
      title: "🚧 Enrollment not implemented yet",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const curriculum = [
    { module: 'Module 1: The Foundation', lessons: ['Understanding the Fog', 'The Cost of Inaction', 'Setting the Baseline'] },
    { module: 'Module 2: Deconstruction', lessons: ['Identifying Limiting Beliefs', 'The Audit Process', 'Cutting the Noise'] },
    { module: 'Module 3: Reconstruction', lessons: ['Building the New Framework', 'Daily Disciplines', 'Protecting Your Focus'] },
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
        <title>{`Course ${id} | Vikram Presence`}</title>
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <Link to="/courses" className="text-gray-400 hover:text-white text-sm uppercase tracking-wider mb-8 inline-block transition-colors">
            ← Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">The Clarity Masterclass {id}</h1>
              <p className="text-xl text-gray-300 mb-12 font-light leading-relaxed">
                A comprehensive video program designed to completely overhaul your mental operating system. Stop drifting and start building with intention.
              </p>

              <h3 className="text-2xl font-bold mb-6">What you'll learn</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
                {outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <CheckCircle className="text-white shrink-0 mt-1" size={20} />
                    <span className="text-gray-300 font-light">{outcome}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-bold mb-6">Course Curriculum</h3>
              <div className="space-y-6 mb-12">
                {curriculum.map((mod, i) => (
                  <div key={i} className="border border-white/10 bg-white/5 p-6">
                    <h4 className="text-lg font-bold mb-4">{mod.module}</h4>
                    <ul className="space-y-3">
                      {mod.lessons.map((lesson, j) => (
                        <li key={j} className="flex items-center text-gray-400 font-light text-sm">
                          <PlayCircle size={16} className="mr-3 opacity-50" />
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-white/20 bg-white/5 p-8 sticky top-32">
                <div className="text-4xl font-bold mb-2">$149.00</div>
                <p className="text-gray-400 text-sm mb-8">Lifetime access. 30-day guarantee.</p>
                
                <button 
                  onClick={handleEnroll}
                  className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors mb-6"
                >
                  Enroll Now
                </button>

                <div className="space-y-4 text-sm text-gray-300 font-light">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span>Instructor</span>
                    <span className="font-medium text-white">Vikram Presence</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span>Level</span>
                    <span className="font-medium text-white">All Levels</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span>Format</span>
                    <span className="font-medium text-white">Video + Workbooks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;
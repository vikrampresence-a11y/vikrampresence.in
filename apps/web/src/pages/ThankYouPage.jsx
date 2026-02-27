
import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productName, googleDriveLink } = location.state || {};

  useEffect(() => {
    // Redirect to home if accessed directly without payment state
    if (!productName && !googleDriveLink) {
      navigate('/');
    }
  }, [productName, googleDriveLink, navigate]);

  if (!productName && !googleDriveLink) return null;

  return (
    <>
      <Helmet>
        <title>Payment Successful | Vikram Presence</title>
      </Helmet>
      
      <div className="min-h-screen bg-[#050505] flex items-center justify-center py-20 px-6">
        <div className="max-w-2xl w-full bg-[#0a0a0a] border-l-4 border-[#FFD700] rounded-2xl shadow-[0_0_40px_rgba(218,165,32,0.15)] p-8 md:p-12 text-center relative overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none"></div>

          <img 
            src="https://horizons-cdn.hostinger.com/b97f6cc3-989b-4f74-bc63-5ca3ca17eb47/be8b4dcc5a2a5cf25f645f196e119fda.png" 
            alt="Vikram Presence Logo" 
            className="w-20 h-20 mx-auto mb-8 object-contain"
            style={{ filter: 'drop-shadow(0 0 15px rgba(218, 165, 32, 0.4))' }}
          />

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-6">
            <CheckCircle size={32} />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Payment Successful
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 font-light">
            Thank you for the trust. Your journey begins now.
          </p>

          <div className="bg-black/50 border border-white/10 rounded-xl p-6 mb-10">
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Purchased Product</p>
            <h2 className="text-2xl font-bold text-[#FFD700]">{productName}</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {googleDriveLink && (
              <a 
                href={googleDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-widest rounded-full hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                <Download size={18} className="mr-2" />
                Access Product
              </a>
            )}
            
            <Link 
              to="/shop"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white/5 transition-all duration-300"
            >
              Explore More <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-10">
            A confirmation email has been sent to your provided details.
          </p>
        </div>
      </div>
    </>
  );
};

export default ThankYouPage;

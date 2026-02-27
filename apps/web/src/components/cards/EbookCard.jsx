import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EbookCard = ({ id, title, description, price, image }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98, boxShadow: '0 0 0px rgba(255,215,0,0)', borderColor: 'rgba(255,255,255,0.05)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, boxShadow: '0 0 25px rgba(255,215,0,0.15)', borderColor: 'rgba(255,215,0,0.4)' }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full"
    >
      <Link to={`/product/${id}`} className="block group h-full">
        <div className="bg-[#080808] border border-inherit rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:-translate-y-1">
          <div className="aspect-[3/4] overflow-hidden relative bg-[#020202]">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
            <img
              src={image || 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=600&q=80'}
              alt={title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-white text-xs font-bold tracking-widest uppercase">Ebook</span>
            </div>
          </div>

          <div className="p-8 flex flex-col flex-grow bg-[#080808]">
            <h3 className="text-xl font-bold text-white mb-3 leading-tight tracking-tight group-hover:text-[#FFD700] transition-colors">{title}</h3>
            <p className="text-gray-400 text-sm mb-6 line-clamp-2 font-light leading-relaxed flex-grow">
              {description}
            </p>
            <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-5">
              <span className="text-xl font-bold text-white">₹{price}</span>
              <span className="text-xs text-[#FFD700] uppercase tracking-widest font-bold flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                View Details <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EbookCard;
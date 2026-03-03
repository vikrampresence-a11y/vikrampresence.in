import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EbookCard = ({ id, title, description, price, image }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link to={`/product/${id}`} className="block group h-full">
        <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:-translate-y-1 hover:border-[#FFD700]/25 hover:shadow-[0_8px_30px_rgba(255,215,0,0.08)]">
          <div className="aspect-[3/4] relative p-[1.5px] group/thumb overflow-hidden bg-black/50">
            {/* Glowing tail background animate-spin */}
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(0,0,0,0.8)_360deg)] animate-[spin_3s_linear_infinite] opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_180deg,transparent_0_340deg,rgba(255,215,0,0.8)_360deg)] animate-[spin_3s_linear_infinite] opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-500" />

            <div className="absolute inset-[1.5px] overflow-hidden bg-black z-10 transition-transform duration-700">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20 pointer-events-none" />
              <img
                src={image || 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=600&q=80'}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ filter: "contrast(1.2) saturate(1.25)" }}
              />
              <div className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-white/70 text-[10px] font-semibold tracking-widest uppercase">Ebook</span>
              </div>
            </div>
          </div>

          <div className="p-7 flex flex-col flex-grow">
            <h3 className="text-lg font-semibold text-white mb-2 leading-tight tracking-tight group-hover:text-[#FFD700] transition-colors duration-300">{title}</h3>
            <p className="text-white/30 text-sm mb-5 line-clamp-2 font-light leading-relaxed flex-grow">
              {description}
            </p>
            <div className="flex justify-between items-center mt-auto border-t border-white/[0.04] pt-4">
              <span className="text-lg font-bold text-white">₹{price}</span>
              <span className="text-[11px] text-[#FFD700]/70 uppercase tracking-widest font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View Details <span className="ml-1.5 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EbookCard;
import React from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ title, description, price, type }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="relative p-[1.5px] rounded-2xl group overflow-hidden h-full block"
    >
      {/* Glowing tail background animate-spin */}
      <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(0,0,0,0.8)_360deg)] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[-100%] bg-[conic-gradient(from_180deg,transparent_0_340deg,rgba(226,240,52,0.5)_360deg)] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="glass-card rounded-[14.5px] p-7 flex flex-col h-full bg-[#050505] relative z-10">
        <div className="mb-4">
          <span className="text-[#E2F034] text-[10px] font-semibold uppercase tracking-widest py-1.5 px-3.5 bg-[#E2F034]/[0.06] border border-[#E2F034]/15 rounded-full inline-flex items-center gap-1.5 transition-all duration-300 group-hover:bg-[#E2F034]/10 group-hover:border-[#E2F034]/25">
            {type}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-white mb-3 leading-tight group-hover:text-[#E2F034] transition-colors duration-300">{title}</h3>
        <p className="text-white/25 mb-6 leading-relaxed font-light flex-grow text-sm">{description}</p>

        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/[0.04]">
          <span className="text-xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(226, 240, 52, 0.08)' }}>₹{price}</span>
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#E2F034]/60 group-hover:text-[#E2F034] transition-all duration-300 group-hover:tracking-[0.2em]">
            View Details →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
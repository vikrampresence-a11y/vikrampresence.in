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
      className="glass-card rounded-2xl p-7 flex flex-col h-full group transition-all duration-500 hover:border-[#E2F034]/20 hover:shadow-[0_12px_40px_rgba(226,240,52,0.06)] card-3d"
    >
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
    </motion.div>
  );
};

export default ProductCard;
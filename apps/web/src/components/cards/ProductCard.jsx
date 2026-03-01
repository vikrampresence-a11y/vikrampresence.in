import React from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ title, description, price, type }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-7 flex flex-col h-full group transition-all duration-500 hover:-translate-y-1 hover:border-[#FFD700]/25 hover:shadow-[0_8px_30px_rgba(255,215,0,0.08)]"
    >
      <div className="mb-4">
        <span className="text-[#FFD700] text-[10px] font-semibold uppercase tracking-widest py-1 px-3 bg-[#FFD700]/[0.08] border border-[#FFD700]/15 rounded-full">{type}</span>
      </div>

      <h3 className="text-xl font-semibold text-white mb-3 leading-tight">{title}</h3>
      <p className="text-white/30 mb-6 leading-relaxed font-light flex-grow text-sm">{description}</p>

      <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/[0.04]">
        <span className="text-xl font-bold text-white">₹{price}</span>
        <span className="text-[11px] font-medium uppercase tracking-widest text-[#FFD700]/70 group-hover:text-[#FFD700] transition-colors">
          View Details →
        </span>
      </div>
    </motion.div>
  );
};

export default ProductCard;
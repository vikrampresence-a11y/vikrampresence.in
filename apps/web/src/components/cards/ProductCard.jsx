import React from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ title, description, price, type }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, boxShadow: '0 0 0px rgba(255,215,0,0)', borderColor: 'rgba(255,255,255,0.05)' }}
      whileInView={{ opacity: 1, y: 0, boxShadow: '0 0 25px rgba(255,215,0,0.15)', borderColor: 'rgba(255,215,0,0.4)' }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#080808] border rounded-2xl p-8 flex flex-col h-full group"
    >
      <div className="mb-4">
        <span className="text-[#FFD700] text-xs font-bold uppercase tracking-widest py-1 px-3 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-full">{type}</span>
      </div>

      <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{title}</h3>
      <p className="text-gray-400 mb-8 leading-relaxed font-light flex-grow">{description}</p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-2xl font-bold text-white">₹{price}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-[#FFD700] group-hover:underline">
          View Details →
        </span>
      </div>
    </motion.div>
  );
};

export default ProductCard;
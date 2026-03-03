import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseCard = ({ id, title, description, lessons, difficulty, price }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link to={`/product/${id}`} className="block group h-full">
        <div className="glass-card rounded-2xl p-7 h-full flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-[#FFD700]/25 hover:shadow-[0_8px_30px_rgba(255,215,0,0.08)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/[0.02] rounded-bl-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-[2]" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-white/[0.06] rounded-full text-[10px] uppercase tracking-widest font-semibold text-white/70 border border-white/[0.06]">
                Course
              </span>
              <span className="text-white/30 text-[11px] font-medium uppercase tracking-widest flex items-center">
                <Play size={10} className="mr-1.5" /> {lessons || 5} Modules
              </span>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3 leading-tight group-hover:text-[#FFD700] transition-colors duration-300">
              {title}
            </h3>

            <p className="text-white/30 text-sm mb-6 font-light leading-relaxed flex-grow">
              {description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/[0.04]">
              <span className="text-lg font-bold text-white">₹{price}</span>
              <span className="text-[11px] text-[#FFD700]/70 uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                Enroll Now <span className="ml-1.5 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
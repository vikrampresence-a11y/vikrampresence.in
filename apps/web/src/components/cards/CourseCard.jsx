import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseCard = ({ id, title, description, lessons, difficulty, price }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98, boxShadow: '0 0 0px rgba(255,215,0,0)', borderColor: 'rgba(255,255,255,0.05)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, boxShadow: '0 0 25px rgba(255,215,0,0.15)', borderColor: 'rgba(255,215,0,0.4)' }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full"
    >
      <Link to={`/product/${id}`} className="block group h-full">
        <div className="bg-[#080808] border border-inherit rounded-2xl p-8 h-full flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-[2]"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-8">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold text-white border border-white/5">
                Course
              </span>
              <span className="text-gray-500 text-xs font-mono uppercase tracking-widest flex items-center">
                <Play size={12} className="mr-2" /> {lessons || 5} Modules
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-[#FFD700] transition-colors">
              {title}
            </h3>

            <p className="text-gray-400 text-sm mb-8 font-light leading-relaxed flex-grow">
              {description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
              <span className="text-xl font-bold text-white">₹{price}</span>
              <span className="text-xs text-[#FFD700] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                Enroll Now <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

const ContentManagement = () => {
  const { toast } = useToast();

  const handleSave = (e) => {
    e.preventDefault();
    toast({
      title: "Content Saved",
      description: "Website content has been updated successfully.",
      style: { backgroundColor: '#FFD700', color: '#000000' }
    });
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white mb-8">Content Management</h2>
      
      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Hero Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Headline</label>
              <input type="text" defaultValue="Presence changes everything." className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subheadline</label>
              <textarea defaultValue="Real thoughts. Real clarity. No hype. Just honest frameworks to help you understand your mind." className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] outline-none h-20" />
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">About Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Content</label>
              <textarea defaultValue="The internet is full of people yelling at you to wake up at 4 AM and hustle harder. But when you're genuinely stuck, yelling doesn't help." className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] outline-none h-32" />
            </div>
          </div>
        </div>

        <button type="submit" className="bg-[#FFD700] text-black px-8 py-3 rounded-lg font-bold uppercase tracking-widest flex items-center hover:bg-yellow-400 transition-colors">
          <Save size={18} className="mr-2" /> Save All Changes
        </button>
      </form>
    </div>
  );
};

export default ContentManagement;
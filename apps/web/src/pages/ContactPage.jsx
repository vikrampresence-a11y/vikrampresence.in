
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Clock, Send, Loader2 } from 'lucide-react';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';
import { useToast } from '@/components/ui/use-toast';
import pb from '@/lib/pocketbaseClient';

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await pb.collection('contact_submissions').create(formData, { $autoCancel: false });
      
      toast({
        title: "Message Sent Successfully",
        description: "We've received your message and will get back to you within 24-48 hours.",
        style: { backgroundColor: '#FFD700', color: '#000000' }
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Vikram Presence</title>
        <meta name="description" content="Get in touch with Vikram Presence. We respond within 24-48 hours." />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">Get in Touch</h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                Have a question about our products or need support? We're here to help.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              <ScrollReveal delay={100}>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 hover:border-[#FFD700]/30 transition-colors">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Mail className="text-[#FFD700]" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
                  <p className="text-gray-400 font-light mb-4">For all inquiries, support, and feedback.</p>
                  <a href="mailto:vikrampresence@gmail.com" className="text-lg font-medium text-white hover:text-[#FFD700] transition-colors">
                    vikrampresence@gmail.com
                  </a>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 hover:border-[#FFD700]/30 transition-colors">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Clock className="text-[#FFD700]" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Response Time</h3>
                  <p className="text-gray-400 font-light">
                    We aim to respond to all inquiries within <strong className="text-white">24-48 hours</strong> during regular business days.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={300}>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-10">
                  <h3 className="text-2xl font-bold text-white mb-8">Send a Message</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subject</label>
                      <input 
                        type="text" 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none transition-colors"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="5"
                        className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] outline-none transition-colors resize-none"
                        placeholder="Write your message here..."
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-[#FFD700] text-black font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin mr-2" size={20} /> Sending...</>
                      ) : (
                        <><Send size={18} className="mr-2" /> Send Message</>
                      )}
                    </button>
                  </form>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;

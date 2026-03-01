
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

  const inputClassName = "w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm font-light focus:border-[#FFD700]/50 focus:shadow-[0_0_0_1px_rgba(255,215,0,0.1)] outline-none transition-all duration-300 placeholder:text-white/20";

  return (
    <>
      <Helmet>
        <title>Contact Us | Vikram Presence</title>
        <meta name="description" content="Get in touch with Vikram Presence. We respond within 24-48 hours." />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-36 pb-28">
        <div className="container mx-auto px-6 max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">Get in Touch</h1>
              <div className="w-10 h-[2px] bg-[#FFD700] mx-auto mb-5 opacity-60" />
              <p className="text-base text-white/40 max-w-lg mx-auto font-light">
                Have a question about our products or need support? We're here to help.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <ScrollReveal delay={100}>
                <div className="glass-card rounded-2xl p-7 transition-all duration-500 hover:border-[#FFD700]/20">
                  <div className="w-10 h-10 bg-white/[0.04] rounded-full flex items-center justify-center mb-5">
                    <Mail className="text-[#FFD700]/70" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1.5">Email Us</h3>
                  <p className="text-white/30 font-light text-sm mb-4">For all inquiries, support, and feedback.</p>
                  <a href="mailto:vikrampresence@gmail.com" className="text-base font-medium text-white/70 hover:text-[#FFD700] transition-colors">
                    vikrampresence@gmail.com
                  </a>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="glass-card rounded-2xl p-7 transition-all duration-500 hover:border-[#FFD700]/20">
                  <div className="w-10 h-10 bg-white/[0.04] rounded-full flex items-center justify-center mb-5">
                    <Clock className="text-[#FFD700]/70" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1.5">Response Time</h3>
                  <p className="text-white/30 font-light text-sm">
                    We aim to respond within <strong className="text-white/50">24-48 hours</strong> during regular business days.
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={300}>
                <div className="glass-card rounded-2xl p-7 md:p-9">
                  <h3 className="text-xl font-semibold text-white mb-7">Send a Message</h3>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-2">Your Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className={inputClassName}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={inputClassName}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-2">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className={inputClassName}
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-2">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="5"
                        className={`${inputClassName} resize-none`}
                        placeholder="Write your message here..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#FFD700] text-black font-bold uppercase tracking-[0.15em] text-[12px] py-3.5 rounded-xl hover:bg-yellow-400 transition-all duration-300 flex items-center justify-center disabled:opacity-50 shimmer-btn"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin mr-2" size={16} /> Sending...</>
                      ) : (
                        <><Send size={14} className="mr-2" /> Send Message</>
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

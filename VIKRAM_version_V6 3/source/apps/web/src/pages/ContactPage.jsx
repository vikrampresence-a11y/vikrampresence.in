
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Clock, Send, Loader2, MapPin, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// ═══════════════════════════════════════════════════════
// Floating Particles
// ═══════════════════════════════════════════════════════
const FloatingParticles = ({ count = 12 }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 4}s`,
    size: Math.random() > 0.5 ? 3 : 2,
  }));
  return (
    <div className="floating-particles">
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{
          left: p.left, top: p.top,
          width: `${p.size}px`, height: `${p.size}px`,
          '--duration': p.duration, '--delay': p.delay,
        }} />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT — Contact Page (Pro-Max)
// ═══════════════════════════════════════════════════════
const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
      // Send via PHP backend email
      const isShopDomain = typeof window !== 'undefined' && window.location.hostname.includes('vikrampresence.shop');
      const endpoint = isShopDomain ? '/api/send-email.php' : '/api/send-email.php';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_custom_email',
          email: 'vikrampresence@gmail.com', // Send to admin
          subject: `Contact Form: ${formData.subject}`,
          body: `
            <h2 style="color:#E2F034;margin-bottom:10px;">New Contact Message</h2>
            <p style="color:#aaa;"><strong style="color:#fff;">Name:</strong> ${formData.name}</p>
            <p style="color:#aaa;"><strong style="color:#fff;">Email:</strong> ${formData.email}</p>
            <p style="color:#aaa;"><strong style="color:#fff;">Subject:</strong> ${formData.subject}</p>
            <p style="color:#aaa;margin-top:20px;"><strong style="color:#fff;">Message:</strong></p>
            <p style="color:#ccc;line-height:1.8;">${formData.message.replace(/\n/g, '<br>')}</p>
          `
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast({
          title: "Message Sent Successfully",
          description: "We'll get back to you within 24-48 hours.",
          style: { backgroundColor: '#E2F034', color: '#000000' }
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to send');
      }
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

  // ── Animation variants ──
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const inputClassName = `w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm font-light
    focus:border-[#E2F034]/40 focus:shadow-[0_0_0_1px_rgba(226,240,52,0.08),0_0_30px_rgba(226,240,52,0.03)]
    outline-none transition-all duration-400 placeholder:text-white/15
    hover:border-white/[0.12] hover:bg-white/[0.03]`;

  return (
    <>
      <Helmet>
        <title>Contact Us | Vikram Presence</title>
        <meta name="description" content="Get in touch with Vikram Presence. We respond within 24-48 hours." />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden pt-36 pb-28 font-sans" style={{ background: '#050505' }}>
        <FloatingParticles />

        {/* Ambient glows */}
        <div className="absolute top-20 right-1/4 w-[500px] h-[400px] bg-[#E2F034]/[0.012] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[300px] bg-blue-500/[0.008] blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          className="relative z-10 container mx-auto px-6 max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          {/* ═══ HEADER ═══ */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] font-bold uppercase tracking-[0.2em] text-[#E2F034]/60 mb-6">
              <MessageSquare size={11} />
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Let's <span className="text-[#E2F034]" style={{ textShadow: '0 0 40px rgba(226,240,52,0.15)' }}>Connect</span>
            </h1>
            <p className="text-white/30 text-base max-w-lg mx-auto font-light leading-relaxed">
              Have a question about our products or need support? We're here to help.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ═══ LEFT — Contact Info Cards ═══ */}
            <div className="lg:col-span-5 space-y-5">

              <motion.div variants={itemVariants}
                className="glass-card-premium rounded-2xl p-6 transition-all duration-500 hover:border-[#E2F034]/20 group">
                <div className="w-10 h-10 bg-[#E2F034]/[0.06] border border-[#E2F034]/15 rounded-xl flex items-center justify-center mb-4 group-hover:border-[#E2F034]/30 transition-colors">
                  <Mail className="text-[#E2F034]/70" size={18} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Email Us</h3>
                <p className="text-white/25 font-light text-sm mb-3">For all inquiries, support, and feedback.</p>
                <a href="mailto:vikrampresence@gmail.com"
                  className="text-sm font-medium text-white/60 hover:text-[#E2F034] transition-colors flex items-center gap-1.5 group/link">
                  vikrampresence@gmail.com
                  <ArrowRight size={12} className="opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                </a>
              </motion.div>

              <motion.div variants={itemVariants}
                className="glass-card-premium rounded-2xl p-6 transition-all duration-500 hover:border-[#E2F034]/20 group">
                <div className="w-10 h-10 bg-[#E2F034]/[0.06] border border-[#E2F034]/15 rounded-xl flex items-center justify-center mb-4 group-hover:border-[#E2F034]/30 transition-colors">
                  <Clock className="text-[#E2F034]/70" size={18} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Response Time</h3>
                <p className="text-white/25 font-light text-sm">
                  We aim to respond within <strong className="text-white/50">24-48 hours</strong> during regular business days.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}
                className="glass-card-premium rounded-2xl p-6 transition-all duration-500 hover:border-[#E2F034]/20 group">
                <div className="w-10 h-10 bg-[#E2F034]/[0.06] border border-[#E2F034]/15 rounded-xl flex items-center justify-center mb-4 group-hover:border-[#E2F034]/30 transition-colors">
                  <MapPin className="text-[#E2F034]/70" size={18} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Location</h3>
                <p className="text-white/25 font-light text-sm">
                  Based in India · Serving globally
                </p>
              </motion.div>
            </div>

            {/* ═══ RIGHT — Contact Form (Glassmorphic) ═══ */}
            <motion.div variants={itemVariants} className="lg:col-span-7">
              <div className="glass-card-premium rounded-2xl p-7 md:p-9 relative overflow-hidden">
                {/* Top shimmer edge */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E2F034]/15 to-transparent" />

                {submitted ? (
                  /* ═══ SUCCESS STATE ═══ */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="text-green-400" size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-white/30 text-sm mb-8">We'll get back to you within 24-48 hours.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-3 border border-white/[0.08] text-white/40 text-sm rounded-xl hover:text-white/70 hover:border-white/15 transition-all"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-white mb-7"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      Send a Message
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] mb-2">Your Name</label>
                          <input
                            type="text" name="name" value={formData.name}
                            onChange={handleChange} required
                            className={inputClassName} placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] mb-2">Email Address</label>
                          <input
                            type="email" name="email" value={formData.email}
                            onChange={handleChange} required
                            className={inputClassName} placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] mb-2">Subject</label>
                        <input
                          type="text" name="subject" value={formData.subject}
                          onChange={handleChange} required
                          className={inputClassName} placeholder="How can we help?"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] mb-2">Message</label>
                        <textarea
                          name="message" value={formData.message}
                          onChange={handleChange} required rows="5"
                          className={`${inputClassName} resize-none`}
                          placeholder="Write your message here..."
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full bg-[#E2F034] text-black font-bold uppercase tracking-[0.15em] text-[12px] py-4 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 overflow-hidden hover:shadow-[0_0_40px_rgba(226,240,52,0.2)]"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none skew-x-12" />
                        {isSubmitting ? (
                          <><Loader2 className="animate-spin mr-2" size={16} /> Sending...</>
                        ) : (
                          <><Send size={14} className="mr-2 relative z-10" /> <span className="relative z-10">Send Message</span></>
                        )}
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ContactPage;

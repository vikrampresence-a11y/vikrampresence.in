
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, ExternalLink, ShoppingBag, BookOpen, MonitorPlay,
    Download, Clock, Sparkles, Package
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext.jsx';
import { getPurchases } from '@/lib/purchaseStore';

// ═══════════════════════════════════════════════════════
// Floating Particles (ambient depth)
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
// MAIN COMPONENT — My Products (Pro-Max)
// ═══════════════════════════════════════════════════════
const MyProductsPage = () => {
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser, isAuthenticated } = useAuth();

    // ── Fetch purchases from localStorage (works with PHP OTP auth) ──
    useEffect(() => {
        const loadPurchases = () => {
            try {
                const email = currentUser?.email;
                const results = getPurchases(email);
                setPurchases(results);
            } catch (err) {
                console.error('Failed to load purchases:', err);
            }
            setIsLoading(false);
        };

        // Small delay so auth context resolves
        const timer = setTimeout(loadPurchases, 300);
        return () => clearTimeout(timer);
    }, [currentUser]);

    // ── Stagger animation variants ──
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
                <Loader2 className="w-10 h-10 text-[#E2F034] animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Products | Vikram Presence</title>
                <meta name="description" content="Access your purchased ebooks and courses." />
            </Helmet>

            <div className="min-h-screen relative overflow-hidden pt-32 pb-24 font-sans" style={{ background: '#050505' }}>
                <FloatingParticles />

                {/* Ambient glow */}
                <div className="absolute top-20 left-1/3 w-[600px] h-[400px] bg-[#E2F034]/[0.015] blur-[150px] rounded-full pointer-events-none" />

                <div className="relative z-10 container mx-auto px-6 max-w-5xl">

                    {/* ═══ HEADER ═══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-14"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#E2F034]/[0.08] border border-[#E2F034]/20 flex items-center justify-center"
                                style={{ boxShadow: '0 0 30px rgba(226,240,52,0.06)' }}>
                                <Package className="text-[#E2F034]" size={22} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white"
                                style={{ fontFamily: "'Inter', sans-serif" }}>
                                My Products
                            </h1>
                        </div>
                        <p className="text-white/30 text-base font-light ml-16">
                            {isAuthenticated && currentUser?.email
                                ? `Logged in as ${currentUser.email}`
                                : 'Your purchased ebooks and courses — access them anytime.'}
                        </p>
                    </motion.div>

                    {/* ═══ PRODUCTS GRID ═══ */}
                    {purchases.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {purchases.map((purchase) => (
                                <motion.div
                                    key={purchase.id}
                                    variants={itemVariants}
                                    className="group glass-card-premium rounded-2xl overflow-hidden hover:border-[#E2F034]/30 transition-all duration-500"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-[16/9] overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                                        <img
                                            src={purchase.coverImageUrl ||
                                                (purchase.productType === 'course'
                                                    ? 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=600&q=80'
                                                    : 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=600&q=80')}
                                            alt={purchase.productName}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />

                                        {/* Type badge */}
                                        <div className="absolute top-3 left-3 z-20">
                                            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-[#E2F034]/25 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] text-[#E2F034] flex items-center gap-1.5">
                                                {purchase.productType === 'course' ? <MonitorPlay size={11} /> : <BookOpen size={11} />}
                                                {purchase.productType === 'course' ? 'Course' : 'Ebook'}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        {purchase.pricePaise > 0 && (
                                            <div className="absolute top-3 right-3 z-20">
                                                <span className="px-3 py-1.5 bg-[#E2F034] rounded-full text-[10px] font-black text-black tracking-wide">
                                                    ₹{(purchase.pricePaise / 100).toFixed(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#E2F034] transition-colors">
                                            {purchase.productName}
                                        </h3>

                                        <div className="flex items-center gap-2 text-white/15 text-[10px] mb-5">
                                            <Clock size={10} />
                                            <span>Purchased {new Date(purchase.purchasedAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}</span>
                                            {purchase.paymentId && (
                                                <>
                                                    <span className="text-white/8">·</span>
                                                    <span className="font-mono">{purchase.paymentId.slice(0, 14)}...</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {purchase.googleDriveLink && (
                                                <motion.a
                                                    href={purchase.googleDriveLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#E2F034] text-black font-bold uppercase tracking-[0.12em] text-[10px] rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:shadow-[0_0_30px_rgba(226,240,52,0.2)]"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    <Download size={13} />
                                                    Access Product
                                                </motion.a>
                                            )}
                                            <a
                                                href={purchase.googleDriveLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 border border-white/[0.06] rounded-xl text-white/30 hover:text-[#E2F034] hover:border-[#E2F034]/20 transition-all bg-white/[0.02]"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        /* ═══ EMPTY STATE ═══ */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center py-24"
                        >
                            <div className="w-24 h-24 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-8"
                                style={{ boxShadow: '0 0 40px rgba(255,255,255,0.01)' }}>
                                <ShoppingBag className="text-white/15" size={36} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                No Products Yet
                            </h2>
                            <p className="text-white/25 mb-10 font-light max-w-md mx-auto leading-relaxed">
                                You haven't purchased any products yet. Explore our collection of premium
                                ebooks and courses to start your journey.
                            </p>
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 px-10 py-4 bg-[#E2F034] text-black font-bold uppercase tracking-[0.15em] text-sm rounded-2xl hover:bg-yellow-300 transition-all duration-300 shadow-[0_0_30px_rgba(226,240,52,0.15)] hover:shadow-[0_0_50px_rgba(226,240,52,0.25)]"
                            >
                                <Sparkles size={16} />
                                Explore Shop
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MyProductsPage;

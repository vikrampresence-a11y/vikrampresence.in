import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Loader2, ExternalLink, ShoppingBag, BookOpen, MonitorPlay } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/context/AuthContext.jsx';

const MyProductsPage = () => {
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchPurchases = async () => {
            if (!currentUser) return;
            try {
                const records = await pb.collection('purchases').getFullList({
                    filter: `user="${currentUser.id}" && status="SUCCESS"`,
                    expand: 'product',
                    sort: '-created',
                    $autoCancel: false,
                });
                setPurchases(records);
            } catch (error) {
                console.error('Error fetching purchases:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPurchases();
    }, [currentUser]);

    const getProductImage = (product) => {
        if (product?.image) {
            return pb.files.getUrl(product, product.image);
        }
        return product?.type === 'ebook'
            ? 'https://images.unsplash.com/photo-1544453271-bad31b39b097?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=600&q=80';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Products | Vikram Presence</title>
                <meta name="description" content="Access your purchased ebooks and courses." />
            </Helmet>

            <div className="min-h-screen bg-black text-white pt-32 pb-24 font-sans">
                <div className="container mx-auto px-6 max-w-5xl">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#E2F034]/10 border border-[#E2F034]/30 flex items-center justify-center">
                                <ShoppingBag className="text-[#E2F034]" size={24} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                                My Products
                            </h1>
                        </div>
                        <p className="text-gray-400 text-lg font-light ml-16">
                            Your purchased ebooks and courses — access them anytime.
                        </p>
                    </motion.div>

                    {/* Products Grid */}
                    {purchases.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {purchases.map((purchase, index) => {
                                const product = purchase.expand?.product;
                                if (!product) return null;

                                return (
                                    <motion.div
                                        key={purchase.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="group bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#E2F034]/40 transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(226,240,52,0.1)]"
                                    >
                                        {/* Product Image */}
                                        <div className="aspect-[16/9] overflow-hidden relative">
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 z-10"></div>
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 z-20">
                                                <span className="px-4 py-1.5 bg-black/80 backdrop-blur-md border border-[#E2F034]/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#E2F034] shadow-lg flex items-center gap-1.5">
                                                    {product.type === 'ebook' ? <BookOpen size={12} /> : <MonitorPlay size={12} />}
                                                    {product.type === 'ebook' ? 'Ebook' : 'Course'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#E2F034] transition-colors duration-300">
                                                {product.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm font-light line-clamp-2 mb-6 leading-relaxed">
                                                {product.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500 text-xs uppercase tracking-widest">
                                                    Purchased {new Date(purchase.created).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>

                                                <a
                                                    href={product.googleDriveLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E2F034] text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[#c8d42e] hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(226,240,52,0.3)]"
                                                >
                                                    Access <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center py-20"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                                <ShoppingBag className="text-gray-500" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4 tracking-tighter">
                                No Products Yet
                            </h2>
                            <p className="text-gray-400 mb-10 font-light max-w-md mx-auto">
                                You haven't purchased any products yet. Explore our collection to find ebooks and courses that will transform your journey.
                            </p>
                            <Link
                                to="/shop"
                                className="inline-flex items-center px-10 py-4 bg-[#E2F034] text-black font-bold uppercase tracking-widest rounded-full hover:bg-[#c8d42e] hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(226,240,52,0.3)]"
                            >
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

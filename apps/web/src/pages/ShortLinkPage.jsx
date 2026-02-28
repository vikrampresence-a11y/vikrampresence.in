import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle, Download, Copy, ArrowRight, Loader2 } from 'lucide-react';
import { getAllProducts } from '@/lib/productStore';

/**
 * /t/:paymentId — Short branded link page
 * SMS sends: vikrampresence.shop/t/pay_xyz
 * This page shows the product + Drive link for that payment.
 */
const ShortLinkPage = () => {
    const { paymentId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                // Get most recent product (the one just purchased)
                const products = await getAllProducts();
                if (products.length > 0) {
                    setProduct(products[0]);
                }
            } catch (err) {
                console.error('Error loading product:', err);
            }
            setLoading(false);
        };
        loadProduct();
    }, [paymentId]);

    const handleCopy = () => {
        if (product?.driveLink) {
            navigator.clipboard.writeText(product.driveLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="text-[#FFD700] animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Your Purchase | Vikram Presence</title>
            </Helmet>

            <div className="min-h-screen bg-black flex items-center justify-center py-20 px-6">
                <div className="max-w-lg w-full bg-[#0a0a0a] border-2 border-[#FFD700]/50 rounded-3xl p-8 md:p-10 text-center relative overflow-hidden"
                    style={{ boxShadow: '0 0 50px rgba(255, 204, 0, 0.2)' }}
                >
                    {/* Success Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-400 mb-5">
                        <CheckCircle size={32} />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
                        Thank You! 🎉
                    </h1>

                    {paymentId && paymentId !== 'success' && (
                        <p className="text-xs text-gray-500 font-mono mb-4">Payment: {paymentId}</p>
                    )}

                    {product ? (
                        <>
                            {/* Product Name */}
                            <div className="bg-black/50 border border-white/10 rounded-xl p-5 mb-6">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Your Product</p>
                                <h2 className="text-xl font-bold text-[#FFD700]">{product.title}</h2>
                                {product.description && (
                                    <p className="text-white/40 text-sm mt-2 leading-relaxed">{product.description}</p>
                                )}
                            </div>

                            {/* Drive Link */}
                            {product.driveLink && (
                                <div className="rounded-2xl p-5 mb-6"
                                    style={{ border: '2px solid #FFD700', backgroundColor: '#111', boxShadow: '0 0 25px rgba(255, 204, 0, 0.2)' }}
                                >
                                    <p className="text-[10px] text-[#FFD700] uppercase tracking-widest font-bold mb-3">
                                        ⬇️ ACCESS YOUR PRODUCT
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <a href={product.driveLink} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#FFD700] text-black font-extrabold uppercase tracking-widest rounded-full hover:bg-yellow-400 hover:scale-105 transition-all duration-300 text-sm"
                                            style={{ boxShadow: '0 0 25px rgba(255, 204, 0, 0.5)' }}
                                        >
                                            <Download size={16} /> Open Product
                                        </a>

                                        <button onClick={handleCopy}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all duration-300 text-xs uppercase tracking-widest"
                                        >
                                            <Copy size={14} /> {copied ? 'Copied!' : 'Copy Link'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-8">
                            <p className="text-white/50 text-sm mb-4">
                                Please check your email for the product access link.
                            </p>
                        </div>
                    )}

                    <Link to="/"
                        className="inline-flex items-center text-gray-400 text-xs uppercase tracking-widest hover:text-[#FFD700] transition-colors"
                    >
                        Explore More <ArrowRight size={12} className="ml-2" />
                    </Link>

                    <p className="text-gray-600 text-[10px] mt-6">
                        Save this page — it's your permanent access link.
                    </p>
                </div>
            </div>
        </>
    );
};

export default ShortLinkPage;

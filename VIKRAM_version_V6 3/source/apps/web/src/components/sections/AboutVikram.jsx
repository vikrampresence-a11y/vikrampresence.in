import React from 'react';

/**
 * AboutVikram — God-tier glowing About section.
 * Massive creator scale: 170K Instagram, Ram Speaks YouTube, WhatsApp community.
 */
const AboutVikram = () => {
    return (
        <section
            style={{
                border: '3px solid #ffcc00',
                borderRadius: '20px',
                backgroundColor: '#0a0a0a',
                boxShadow: '0 0 50px rgba(255, 204, 0, 0.6)',
                padding: '40px',
                margin: '50px auto',
                maxWidth: '1000px',
            }}
        >
            {/* Title */}
            <h2
                className="text-4xl md:text-5xl font-extrabold text-center mb-8 tracking-tighter"
                style={{
                    color: '#ffffff',
                    textShadow: '0 0 20px rgba(255, 204, 0, 0.6)',
                }}
            >
                WHO IS VIKRAM PRESENCE?
            </h2>

            {/* Power Copy */}
            <div className="space-y-6 text-center max-w-3xl mx-auto mb-12">
                <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light">
                    A digital force that doesn't ask for attention — it <strong className="text-[#FFD700] font-bold">commands</strong> it.
                </p>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                    With over <strong className="text-[#FFD700] font-bold">170,000+ Instagram followers</strong> consuming
                    daily content on discipline, clarity, and limitless confidence — Vikram Presence is not just
                    a brand. It's a movement that rewires how men think, act, and dominate every room they enter.
                </p>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                    The <strong className="text-[#FFD700] font-bold">Ram Speaks</strong> YouTube channel goes deeper —
                    delivering powerful video breakdowns on mindset engineering, habit architecture, and the psychology
                    of unstoppable growth. What started as one man's vision is now a digital empire touching
                    hundreds of thousands of lives across the globe.
                </p>
                <p className="text-base md:text-lg text-gray-400 leading-relaxed italic">
                    "I don't sell products. I sell transformation."
                </p>
            </div>

            {/* Divider */}
            <div className="w-24 h-[2px] mx-auto mb-10" style={{ background: 'linear-gradient(90deg, transparent, #ffcc00, transparent)' }}></div>

            {/* Social Media Icons */}
            <div className="flex items-center justify-center gap-10 md:gap-16">
                {/* Instagram */}
                <a
                    href="https://www.instagram.com/vikrampresence"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label="Instagram"
                >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="20" height="20" rx="5" stroke="#FFD700" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="5" stroke="#FFD700" strokeWidth="1.5" />
                        <circle cx="18" cy="6" r="1" fill="#FFD700" />
                    </svg>
                </a>

                {/* YouTube */}
                <a
                    href="https://www.youtube.com/@ramspeaks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label="YouTube"
                >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.97A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z" stroke="#FFD700" strokeWidth="1.5" />
                        <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="#FFD700" />
                    </svg>
                </a>

                {/* WhatsApp */}
                <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label="WhatsApp"
                >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#FFD700" />
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="#FFD700" strokeWidth="1.5" />
                    </svg>
                </a>
            </div>
        </section>
    );
};

export default AboutVikram;

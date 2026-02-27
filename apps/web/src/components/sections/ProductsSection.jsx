import React from 'react';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';
import ProductCard from '@/components/cards/ProductCard.jsx';

const ProductsSection = () => {
  const products = [
    {
      id: 1,
      title: 'The Clarity Blueprint',
      description: 'A comprehensive ebook that breaks down the exact framework for finding clarity in chaos. No theory—just actionable steps you can implement today.',
      price: '499',
      type: 'Ebook',
    },
    {
      id: 2,
      title: 'Discipline Masterclass',
      description: 'Video course designed to build unbreakable discipline. Learn daily practices that stick.',
      price: '1499',
      type: 'Course',
    },
    {
      id: 3,
      title: 'Confidence Builder',
      description: 'A step-by-step guide to developing unshakeable self-confidence naturally.',
      price: '799',
      type: 'Ebook',
    },
  ];

  return (
    <section id="products" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Digital Products
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Tools designed for people who are tired of surface-level advice and ready for real transformation.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {products.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 100}>
              <ProductCard {...product} />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div className="text-center mt-16">
            <p className="text-gray-400 mb-6">
              All products come with a 30-day satisfaction guarantee. If it doesn't help, you get your money back.
            </p>
            <a
              href="#contact"
              className="inline-block px-8 py-3 border border-white text-white font-semibold hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wider text-sm"
            >
              Have Questions?
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ProductsSection;
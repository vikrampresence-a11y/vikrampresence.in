import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronDown } from 'lucide-react';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';

const faqs = [
  {
    question: "How do I access my purchased courses or ebooks?",
    answer: "Upon purchase, you will receive an email with a secure link to download your ebooks or access your course. You have lifetime access to all purchased materials."
  },
  {
    question: "What is your refund policy?",
    answer: "Given the nature of premium digital downloads, no refunds are provided once you access the ebook or course link."
  },
  {
    question: "Do I need any prior knowledge before taking a course?",
    answer: "No. Our frameworks are designed to be accessible to anyone, regardless of where they are starting from. We build from the ground up."
  }
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <>
      <Helmet>
        <title>FAQ | Vikram Presence</title>
        <meta name="description" content="Frequently asked questions about Vikram Presence products." />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <ScrollReveal>
            <h1 className="text-5xl md:text-6xl font-bold mb-16 tracking-tight text-center">FAQ</h1>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-white/10 bg-white/5 overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <span className="font-medium text-lg">{faq.question}</span>
                    <ChevronDown
                      className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                      size={20}
                    />
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <p className="text-gray-400 font-light leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
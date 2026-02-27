
import React from 'react';
import { Helmet } from 'react-helmet';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';

const RefundPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy | Vikram Presence</title>
        <meta name="description" content="Refund and cancellation policy for Vikram Presence digital products." />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            <h1 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter">Refund Policy</h1>
            <p className="text-gray-400 mb-12 font-light">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-12 text-gray-300 font-light leading-relaxed">

              <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 p-6 rounded-xl mb-12">
                <h2 className="text-xl font-bold text-[#FFD700] mb-2">Core Policy Statement</h2>
                <p className="text-white font-medium">
                  As our products are digital downloads (Ebooks and Courses), no refunds will be provided once the access link has been used.
                </p>
              </div>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Refund Eligibility</h2>
                <p>
                  Due to the nature of digital goods, we can only process refunds under very specific circumstances. You are eligible for a full refund ONLY if:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-400">
                  <li>You have purchased the product but have <strong>NOT</strong> clicked the download link or accessed the content portal.</li>
                  <li>You accidentally purchased the exact same product twice (duplicate transaction).</li>
                  <li>There is a proven technical defect with the file that we are unable to resolve within 48 hours of you reporting it.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Timeframe for Refund Requests</h2>
                <p>
                  If you meet the eligibility criteria above, you must submit your refund request within <strong>7 days</strong> of the original purchase date. Requests made after this 7-day period will not be considered, regardless of whether the file has been downloaded.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Cancellation Process</h2>
                <p>
                  To request a cancellation and refund for an un-downloaded product, please email us at <strong>vikrampresence@gmail.com</strong> with the subject line "Refund Request - [Your Order Number]". Please include:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-400">
                  <li>Your full name</li>
                  <li>The email address used for the purchase</li>
                  <li>The order number or transaction ID</li>
                  <li>The reason for the refund request</li>
                </ul>
                <p className="mt-4">
                  We will verify our system logs to confirm the file has not been accessed before processing the refund.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Exceptions</h2>
                <p>
                  We do not offer refunds for "change of mind," "did not like the content," or "bought by mistake" if the file has already been accessed. By completing your purchase and accessing the digital file, you explicitly waive your right to a refund.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Contact Information for Disputes</h2>
                <p>
                  If you believe you have been charged in error or have an issue with your purchase that falls outside these guidelines, please contact our support team at <strong>vikrampresence@gmail.com</strong>. We aim to respond to all inquiries within 24-48 hours and will work with you to find a fair resolution.
                </p>
              </section>

            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
};

export default RefundPolicyPage;

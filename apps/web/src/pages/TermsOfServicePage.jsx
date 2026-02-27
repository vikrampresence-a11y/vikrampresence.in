
import React from 'react';
import { Helmet } from 'react-helmet';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';

const TermsOfServicePage = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Vikram Presence</title>
        <meta name="description" content="Terms of Service and usage rights for Vikram Presence digital products." />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            <h1 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter">Terms of Service</h1>
            <p className="text-gray-400 mb-12 font-light">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-12 text-gray-300 font-light leading-relaxed">

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
                <p>
                  By accessing or using the website and purchasing digital products from Vikram Presence, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service or purchase our products.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Digital Products and Delivery</h2>
                <p>
                  Vikram Presence sells digital content, strictly Ebooks and Courses. Upon successful payment processing, you will receive instant access via a secure link. Because these are digital goods delivered instantly, all sales are final once the download link has been accessed.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. License and Usage Rights</h2>
                <p className="mb-4">When you purchase a digital product from Vikram Presence, you are granted a limited, non-exclusive, non-transferable, and revocable license to access and use the content for your personal, non-commercial use only. You strictly agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Reproduce, duplicate, copy, sell, resell, or exploit any portion of the digital products.</li>
                  <li>Share your download links or account access with third parties.</li>
                  <li>Modify, alter, or create derivative works based on our content.</li>
                  <li>Distribute the content publicly or upload it to file-sharing networks.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property Rights</h2>
                <p>
                  All content, features, and functionality (including but not limited to all information, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Vikram Presence and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. User Responsibilities</h2>
                <p>
                  You are responsible for ensuring that your device meets the minimum system requirements necessary to download and access the digital products. You are also responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
                <p>
                  In no event shall Vikram Presence, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the products; (ii) any conduct or content of any third party on the service; or (iii) unauthorized access, use or alteration of your transmissions or content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </p>
              </section>

            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
};

export default TermsOfServicePage;

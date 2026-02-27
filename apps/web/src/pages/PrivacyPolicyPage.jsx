
import React from 'react';
import { Helmet } from 'react-helmet';
import ScrollReveal from '@/components/shared/ScrollReveal.jsx';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Vikram Presence</title>
        <meta name="description" content="Privacy Policy for Vikram Presence digital products and services." />
      </Helmet>

      <div className="bg-black min-h-screen text-white pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            <h1 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter">Privacy Policy</h1>
            <p className="text-gray-400 mb-12 font-light">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-12 text-gray-300 font-light leading-relaxed">
              
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p>
                  Welcome to Vikram Presence. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. The Data We Collect About You</h2>
                <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                  <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                  <li><strong>Financial Data:</strong> includes payment card details (processed securely via our third-party payment processor, Razorpay). We do not store your full credit card details on our servers.</li>
                  <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                  <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Data Encryption and Protection Methods</h2>
                <p>
                  We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. All data transfers between your browser and our servers are encrypted using industry-standard SSL/TLS protocols. Access to your personal data is limited to those employees, agents, contractors, and other third parties who have a business need to know.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Integrations</h2>
                <p>
                  We use Razorpay as our payment gateway for processing transactions. When you make a purchase, your payment data is securely transmitted directly to Razorpay. Razorpay's use of your personal information is governed by their respective privacy policies. We ensure that all third-party service providers we use are compliant with strict data protection standards.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Cookie Policy</h2>
                <p>
                  Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. GDPR and Data Protection Compliance</h2>
                <p>
                  If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR). We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Your Legal Rights</h2>
                <p className="mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                  <li>Request access to your personal data.</li>
                  <li>Request correction of your personal data.</li>
                  <li>Request erasure of your personal data.</li>
                  <li>Object to processing of your personal data.</li>
                  <li>Request restriction of processing your personal data.</li>
                  <li>Request transfer of your personal data.</li>
                  <li>Right to withdraw consent.</li>
                </ul>
                <p className="mt-4">If you wish to exercise any of the rights set out above, please contact us at vikrampresence@gmail.com.</p>
              </section>

            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;

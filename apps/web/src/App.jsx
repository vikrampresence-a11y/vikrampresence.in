
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ScrollToTop from './components/layout/ScrollToTop';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import EbooksPage from './pages/EbooksPage';
import CoursesPage from './pages/CoursesPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import ThankYouPage from './pages/ThankYouPage';
import { Toaster } from '@/components/ui/toaster';
import { PaymentProvider } from '@/context/PaymentContext.jsx';

function App() {
  return (
    <PaymentProvider>
      <Router>
        <Helmet>
          <link rel="icon" type="image/png" href="https://horizons-cdn.hostinger.com/b97f6cc3-989b-4f74-bc63-5ca3ca17eb47/be8b4dcc5a2a5cf25f645f196e119fda.png" />
          <title>Vikram Presence | Digital Products</title>
          <meta name="description" content="Unleash your digital presence. Get clear. Build habits. Be confident." />
        </Helmet>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-black font-sans selection:bg-[#FFD700] selection:text-black">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/ebooks" element={<EbooksPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />

              {/* Policy Routes */}
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
      </Router>
    </PaymentProvider>
  );
}

export default App;

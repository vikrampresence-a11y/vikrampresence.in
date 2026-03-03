
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Package, FileText, CreditCard, LayoutTemplate } from 'lucide-react';
import ProductsManagement from '@/components/admin/ProductsManagement.jsx';
import FileUploadManager from '@/components/admin/FileUploadManager.jsx';
import OrdersPayments from '@/components/admin/OrdersPayments.jsx';
import ContentManagement from '@/components/admin/ContentManagement.jsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'orders', label: 'Orders', icon: CreditCard },
    { id: 'content', label: 'Content', icon: LayoutTemplate },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Vikram Presence</title>
      </Helmet>

      <div className="min-h-screen bg-black pt-32 pb-20 font-sans">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Command Center</h1>
            <p className="text-gray-400 mt-2 font-light">Manage products, files, and orders.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 sticky top-32 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <tab.icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow">
              {activeTab === 'products' && <ProductsManagement />}
              {activeTab === 'files' && <FileUploadManager />}
              {activeTab === 'orders' && <OrdersPayments />}
              {activeTab === 'content' && <ContentManagement />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

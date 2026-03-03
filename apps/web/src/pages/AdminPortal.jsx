import React, { useState } from 'react';
import AdminLogin, { AUTH_KEY } from '@/components/admin/AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardPage from '@/pages/admin/DashboardPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import OrdersPage from '@/pages/admin/OrdersPage';
import EmailerPage from '@/pages/admin/EmailerPage';
import GlobalSettingsPage from '@/pages/admin/GlobalSettingsPage';
import HomepageControlPage from '@/pages/admin/HomepageControlPage';
import ContentManagerPage from '@/pages/admin/ContentManagerPage';
import PromotionsPage from '@/pages/admin/PromotionsPage';
import WhatsAppPage from '@/pages/admin/WhatsAppPage';
import DeveloperPage from '@/pages/admin/DeveloperPage';
import BackupPage from '@/pages/admin/BackupPage';
// V3 NEW PAGES
import CheckoutControlPage from '@/pages/admin/CheckoutControlPage';
import DesignSystemPage from '@/pages/admin/DesignSystemPage';
import AutomationPage from '@/pages/admin/AutomationPage';
import SeoCommandCenterPage from '@/pages/admin/SeoCommandCenterPage';
import MediaLibraryPage from '@/pages/admin/MediaLibraryPage';
import AuditTrailPage from '@/pages/admin/AuditTrailPage';
import AccessControlPage from '@/pages/admin/AccessControlPage';
import ErrorLogPage from '@/pages/admin/ErrorLogPage';

// ═══════════════════════════════════════════════
// ADMIN PORTAL V3 — NASA-Level Master Control
// 19 Pages · Firebase Real-Time · Full Control
// ═══════════════════════════════════════════════

const PAGES = {
    // Analytics
    dashboard: DashboardPage,
    analytics: DashboardPage,
    // Commerce
    products: ProductsPage,
    orders: OrdersPage,
    promotions: PromotionsPage,
    checkout: CheckoutControlPage,
    // Communication
    emailer: EmailerPage,
    whatsapp: WhatsAppPage,
    automation: AutomationPage,
    // Website Control
    globalSettings: GlobalSettingsPage,
    homepage: HomepageControlPage,
    content: ContentManagerPage,
    seo: SeoCommandCenterPage,
    design: DesignSystemPage,
    // Media
    media: MediaLibraryPage,
    // System
    developer: DeveloperPage,
    backup: BackupPage,
    audit: AuditTrailPage,
    access: AccessControlPage,
    errors: ErrorLogPage,
};

const AdminPortal = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => sessionStorage.getItem(AUTH_KEY) === 'true'
    );
    const [activePage, setActivePage] = useState('dashboard');

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }

    const PageComponent = PAGES[activePage] || DashboardPage;

    return (
        <AdminLayout
            activePage={activePage}
            onNavigate={setActivePage}
            onLogout={() => setIsAuthenticated(false)}
        >
            <PageComponent />
        </AdminLayout>
    );
};

export default AdminPortal;

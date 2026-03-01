import React, { useState } from 'react';
import AdminLogin, { AUTH_KEY } from '@/components/admin/AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardPage from '@/pages/admin/DashboardPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import OrdersPage from '@/pages/admin/OrdersPage';
import EmailerPage from '@/pages/admin/EmailerPage';

// ═══════════════════════════════════════════════
// ADMIN PORTAL — Elite Command Center
// Hidden at /admin-vikram — Deep Space Theme
// ═══════════════════════════════════════════════

const PAGES = {
    dashboard: DashboardPage,
    products: ProductsPage,
    orders: OrdersPage,
    emailer: EmailerPage,
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

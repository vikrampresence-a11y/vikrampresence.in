import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Download, Upload, ShieldCheck, RefreshCw, CheckCircle, Loader2, AlertTriangle, Package, FileJson } from 'lucide-react';
import { getAllProducts } from '@/lib/productStore';
import { getSiteSettings } from '@/lib/siteSettings';

const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={16} />{msg}</motion.div>}</AnimatePresence>
);

const ActionCard = ({ icon: Icon, title, desc, buttonText, buttonClass, onClick, loading, variant = 'default' }) => (
    <motion.div whileHover={{ y: -2 }} className={`p-6 rounded-2xl border transition-all duration-300 ${variant === 'danger' ? 'border-red-500/15 bg-red-500/[0.02]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-red-500/10 border border-red-500/20' : 'bg-[#d4ff00]/10 border border-[#d4ff00]/15'}`}>
            <Icon size={18} className={variant === 'danger' ? 'text-red-400' : 'text-[#d4ff00]'} />
        </div>
        <h3 className="text-white font-semibold mb-1.5">{title}</h3>
        <p className="text-white/30 text-xs leading-relaxed mb-4">{desc}</p>
        <motion.button onClick={onClick} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${buttonClass}`}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
            {loading ? 'Please wait...' : buttonText}
        </motion.button>
    </motion.div>
);

const BackupPage = () => {
    const [toast, setToast] = useState({ msg: '' });
    const [exportingFull, setExportingFull] = useState(false);
    const [exportingProducts, setExportingProducts] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };

    const downloadJSON = (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    const exportFullBackup = async () => {
        setExportingFull(true);
        try {
            const [products, settings] = await Promise.all([getAllProducts(), getSiteSettings()]);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backup = { version: '1.0', exportedAt: new Date().toISOString(), products, siteSettings: settings };
            downloadJSON(backup, `vikrampresence-backup-${timestamp}.json`);
            showToast('✅ Full backup downloaded!');
        } catch { showToast('❌ Export failed', 'error'); }
        setExportingFull(false);
    };

    const exportProductsOnly = async () => {
        setExportingProducts(true);
        try {
            const products = await getAllProducts();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            downloadJSON({ version: '1.0', exportedAt: new Date().toISOString(), products }, `vp-products-${timestamp}.json`);
            showToast('✅ Products backup downloaded!');
        } catch { showToast('❌ Export failed', 'error'); }
        setExportingProducts(false);
    };

    const handleRestoreFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setRestoreLoading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!data.version || !data.products) { showToast('❌ Invalid backup file format', 'error'); setRestoreLoading(false); return; }
                // Save products to localStorage as restore
                localStorage.setItem('vp_products', JSON.stringify(data.products));
                if (data.siteSettings) localStorage.setItem('vp_site_settings', JSON.stringify(data.siteSettings));
                showToast(`✅ Restored ${data.products.length} products! Refresh to see changes.`);
            } catch { showToast('❌ Failed to parse backup file', 'error'); }
            setRestoreLoading(false);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Backup & Restore</h1>
                <p className="text-white/25 text-xs mt-1">Export your data as JSON, restore from backups — always keep your data safe</p>
            </div>

            <div className="p-4 bg-blue-500/[0.05] border border-blue-500/15 rounded-xl mb-8 text-blue-400/70 text-xs flex items-start gap-3">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold mb-1">Backup Recommendations</p>
                    <p>• Export a full backup before making major changes<br />• Store backups in Google Drive or locally<br />• Firebase Firestore also auto-backs up your data daily (if configured)</p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <ActionCard icon={Database} title="Full Backup" desc="Download all products + site settings as a single JSON file. Use this before major updates." buttonText="Export Full Backup" buttonClass="bg-[#d4ff00]/10 border border-[#d4ff00]/20 text-[#d4ff00] hover:bg-[#d4ff00]/20" onClick={exportFullBackup} loading={exportingFull} />
                <ActionCard icon={Package} title="Products Only" desc="Download just the products catalog as JSON. Useful for migrating product data." buttonText="Export Products" buttonClass="bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20" onClick={exportProductsOnly} loading={exportingProducts} />
                <ActionCard icon={Upload} title="Restore Backup" desc="Upload a previously downloaded backup JSON file to restore your data." buttonText="Choose File to Restore" buttonClass="bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20" onClick={() => document.getElementById('restoreInput').click()} loading={restoreLoading} />
            </div>

            {/* Hidden restore input */}
            <input id="restoreInput" type="file" accept=".json" className="hidden" onChange={handleRestoreFile} />

            {/* Restore warning */}
            <div className="p-4 bg-red-500/[0.05] border border-red-500/15 rounded-xl text-red-400/70 text-xs flex items-start gap-3">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold mb-1">⚠️ Restore Warning</p>
                    <p>Restoring from backup will overwrite local storage data. For Firebase, you'll need to manually import using Firebase Console. Restore feature works with the localStorage fallback only.</p>
                </div>
            </div>

            {/* Firebase Status */}
            <div className="mt-8 p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><FileJson size={16} className="text-[#d4ff00]" /> Firebase Firestore</h3>
                <p className="text-white/40 text-sm mb-3">If you have Firebase configured, your data is automatically backed up by Google's infrastructure. Daily automatic backups are enabled for Firestore in the Firebase Console.</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-white/40 text-xs">Firebase handles automatic cloud backups — no manual action needed</span>
                </div>
            </div>
        </div>
    );
};

export default BackupPage;

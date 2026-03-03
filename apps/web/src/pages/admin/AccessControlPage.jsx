import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Crown, FileText, DollarSign, CheckCircle, X } from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '@/lib/siteSettings';

// ═══════════════════════════════════════════════
// ACCESS CONTROL — Role-Based Permission Matrix
// Note: Client-side UI — not real server auth
// ═══════════════════════════════════════════════

const ROLES = [
    { id: 'superAdmin', label: 'Super Admin', icon: Crown, color: '#d4ff00', desc: 'Full access to everything — owner level' },
    { id: 'contentManager', label: 'Content Manager', icon: FileText, color: '#60a5fa', desc: 'Can edit pages, blog, products — no finance access' },
    { id: 'financeManager', label: 'Finance Manager', icon: DollarSign, color: '#34d399', desc: 'View orders, payment logs — no content editing' },
];

const PERMISSIONS = [
    { key: 'viewDashboard', label: 'View Dashboard & Analytics' },
    { key: 'manageProducts', label: 'Add / Edit / Delete Products' },
    { key: 'manageOrders', label: 'View & Manage Orders' },
    { key: 'editContent', label: 'Edit Page Content (About, Blog, etc.)' },
    { key: 'managePromotions', label: 'Create Coupons & Flash Sales' },
    { key: 'editHomepage', label: 'Edit Homepage Control' },
    { key: 'globalSettings', label: 'Change Global Settings' },
    { key: 'viewPaymentLogs', label: 'View Payment Logs' },
    { key: 'managePaymentKeys', label: 'Edit Razorpay Keys' },
    { key: 'developerTools', label: 'Access Developer Tools' },
    { key: 'backup', label: 'Backup & Restore Data' },
    { key: 'auditLog', label: 'View Audit Trail' },
];

const DEFAULT_MATRIX = {
    superAdmin: { viewDashboard: true, manageProducts: true, manageOrders: true, editContent: true, managePromotions: true, editHomepage: true, globalSettings: true, viewPaymentLogs: true, managePaymentKeys: true, developerTools: true, backup: true, auditLog: true },
    contentManager: { viewDashboard: true, manageProducts: true, manageOrders: false, editContent: true, managePromotions: true, editHomepage: true, globalSettings: false, viewPaymentLogs: false, managePaymentKeys: false, developerTools: false, backup: false, auditLog: false },
    financeManager: { viewDashboard: true, manageProducts: false, manageOrders: true, editContent: false, managePromotions: false, editHomepage: false, globalSettings: false, viewPaymentLogs: true, managePaymentKeys: false, developerTools: false, backup: false, auditLog: true },
};

const AccessControlPage = () => {
    const [matrix, setMatrix] = useState(DEFAULT_MATRIX);
    const [saved, setSaved] = useState(false);

    const toggle = (role, perm) => setMatrix(m => ({ ...m, [role]: { ...m[role], [perm]: !m[role][perm] } }));

    const handleSave = async () => {
        try { await updateSiteSettings({ roleMatrix: matrix }); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch { }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div><h1 className="text-2xl font-bold text-white tracking-tight">Access Control</h1><p className="text-white/25 text-xs mt-1">Define what each admin role can see and do</p></div>
                <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl cursor-pointer transition-all ${saved ? 'bg-green-400 text-black' : 'bg-[#d4ff00] text-black'}`}>
                    {saved ? <><CheckCircle size={14} /> Saved!</> : <><Shield size={14} /> Save Permissions</>}
                </motion.button>
            </div>

            <div className="mb-6 p-4 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl text-amber-400/70 text-xs flex items-start gap-3">
                <Shield size={13} className="shrink-0 mt-0.5" />
                <p>⚠️ Note: Role restrictions here are client-side UI controls. For production multi-admin setups, implement Firebase Authentication with custom claims for true server-side access control.</p>
            </div>

            {/* Role Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {ROLES.map(role => (
                    <div key={role.id} className="p-5 rounded-2xl border" style={{ borderColor: role.color + '25', background: role.color + '08' }}>
                        <div className="flex items-center gap-2.5 mb-2">
                            <role.icon size={18} style={{ color: role.color }} />
                            <span className="text-white font-bold text-sm">{role.label}</span>
                        </div>
                        <p className="text-white/30 text-xs">{role.desc}</p>
                    </div>
                ))}
            </div>

            {/* Permission Matrix */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 pb-4 pr-4">Permission</th>
                            {ROLES.map(r => (
                                <th key={r.id} className="text-center pb-4 px-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <r.icon size={13} style={{ color: r.color }} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: r.color }}>{r.label.split(' ')[0]}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERMISSIONS.map((perm, i) => (
                            <tr key={perm.key} className={`border-t ${i % 2 === 0 ? 'border-white/[0.04]' : 'border-white/[0.02] bg-white/[0.01]'}`}>
                                <td className="py-3 pr-4 text-white/50 text-sm">{perm.label}</td>
                                {ROLES.map(role => (
                                    <td key={role.id} className="py-3 px-4 text-center">
                                        <button onClick={() => role.id === 'superAdmin' ? null : toggle(role.id, perm.key)}
                                            className={`w-7 h-7 rounded-lg border flex items-center justify-center mx-auto transition-all ${role.id === 'superAdmin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${matrix[role.id]?.[perm.key] ? 'bg-[#d4ff00]/10 border-[#d4ff00]/30' : 'bg-white/[0.02] border-white/[0.08]'}`}>
                                            {matrix[role.id]?.[perm.key] ? <CheckCircle size={13} className="text-[#d4ff00]" /> : <X size={11} className="text-white/15" />}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AccessControlPage;

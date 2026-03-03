import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Braces, FileCode, Globe, Bot, Download, Upload, Save, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '@/lib/siteSettings';

const Label = ({ children, hint }) => (
    <div className="flex items-center justify-between mb-2">
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{children}</label>
        {hint && <span className="text-[10px] text-white/20">{hint}</span>}
    </div>
);
const CodeEditor = ({ value, onChange, placeholder, rows = 12, language = 'css' }) => (
    <div className="relative">
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-white/[0.04] text-white/20 border border-white/[0.06]">{language}</div>
        <textarea
            rows={rows}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            className="w-full px-4 py-3 pr-16 bg-[#0d0d0d] border border-white/[0.08] rounded-xl text-green-400 text-xs placeholder-white/10 focus:outline-none focus:border-[#d4ff00]/30 transition-all font-mono leading-relaxed resize-y"
        />
    </div>
);
const Section = ({ icon: Icon, title, desc, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/15 flex items-center justify-center"><Icon size={13} className="text-[#d4ff00]" /></div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-[0.15em]">{title}</h3>
        </div>
        {desc && <p className="text-white/25 text-xs mb-4 ml-9">{desc}</p>}
        <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-5">{children}</div>
    </div>
);
const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={16} />{msg}</motion.div>}</AnimatePresence>
);

const DeveloperPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '' });
    const [activeTab, setActiveTab] = useState('css');

    useEffect(() => { getSiteSettings().then(s => { setSettings(s); setLoading(false); }); }, []);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };
    const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSiteSettings({
                customCss: settings.customCss,
                customJs: settings.customJs,
                headerScripts: settings.headerScripts,
                footerScripts: settings.footerScripts,
                robotsTxt: settings.robotsTxt,
            });
            showToast('✅ Developer settings saved! Reload site to see CSS/JS applied.');
        } catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    const TABS = [
        { id: 'css', label: 'Custom CSS', icon: Code2 },
        { id: 'js', label: 'Custom JS', icon: Braces },
        { id: 'head', label: 'Header Scripts', icon: FileCode },
        { id: 'footer', label: 'Footer Scripts', icon: FileCode },
        { id: 'robots', label: 'Robots.txt', icon: Bot },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Developer Tools</h1>
                    <p className="text-white/25 text-xs mt-1">Inject custom CSS, JavaScript, and scripts globally without touching code</p>
                </div>
                <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save & Apply
                </motion.button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl mb-6 text-amber-400/70 text-xs">
                <AlertTriangle size={13} className="shrink-0" />
                Changes apply globally to the frontend. Invalid CSS/JS may affect site appearance. Test changes before going live.
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${activeTab === tab.id ? 'bg-[#d4ff00]/10 border-[#d4ff00]/40 text-[#d4ff00]' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60'}`}>
                        <tab.icon size={12} />{tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'css' && (
                <div>
                    <Label hint={`${(settings.customCss || '').length} chars`}>Custom CSS — Applied globally to all pages via &lt;style&gt; tag</Label>
                    <CodeEditor language="css" value={settings.customCss || ''} onChange={v => set('customCss', v)}
                        placeholder={`/* Example: change button color */\n.btn-primary {\n  background: #ff6b00;\n  color: white;\n}\n\n/* Hide an element */\n.some-element {\n  display: none;\n}`} rows={16} />
                </div>
            )}
            {activeTab === 'js' && (
                <div>
                    <Label hint={`${(settings.customJs || '').length} chars`}>Custom JavaScript — Injected before &lt;/body&gt; on every page</Label>
                    <CodeEditor language="js" value={settings.customJs || ''} onChange={v => set('customJs', v)}
                        placeholder={`// Example: Track custom event\nconsole.log('Custom JS loaded');\n\n// Example: Intercom / Crisp chat\nwindow.Intercom && window.Intercom('boot', {\\n  app_id: 'YOUR_ID'\\n});`} rows={16} />
                </div>
            )}
            {activeTab === 'head' && (
                <div>
                    <Label>Header Scripts — Injected into &lt;head&gt; once on app load</Label>
                    <p className="text-white/20 text-xs mb-3">Paste full &lt;script&gt; or &lt;meta&gt; tags here. E.g. Google Analytics, Facebook Pixel, Hotjar, etc.</p>
                    <CodeEditor language="html" value={settings.headerScripts || ''} onChange={v => set('headerScripts', v)}
                        placeholder={`<!-- Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXX');\n</script>`} rows={14} />
                </div>
            )}
            {activeTab === 'footer' && (
                <div>
                    <Label>Footer Scripts — Injected before &lt;/body&gt; close tag</Label>
                    <CodeEditor language="html" value={settings.footerScripts || ''} onChange={v => set('footerScripts', v)}
                        placeholder={`<!-- Crisp Chat -->\n<script type="text/javascript">\n  window.$crisp=[];\n  window.CRISP_WEBSITE_ID="YOUR-ID";\n  (function(){d=document;s=d.createElement("script");\n  s.src="https://client.crisp.chat/l.js";\n  s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();\n</script>`} rows={14} />
                </div>
            )}
            {activeTab === 'robots' && (
                <div>
                    <Label>Robots.txt — Tell search engines what to crawl</Label>
                    <CodeEditor language="txt" value={settings.robotsTxt || ''} onChange={v => set('robotsTxt', v)}
                        placeholder={`User-agent: *\nAllow: /\n\nSitemap: https://vikrampresence.in/sitemap.xml`} rows={10} />
                    <p className="text-white/15 text-xs mt-2">⚠️ Note: The actual robots.txt file on your server must be updated separately on Hostinger. This is for reference and future dynamic serving.</p>
                </div>
            )}
        </div>
    );
};

export default DeveloperPage;

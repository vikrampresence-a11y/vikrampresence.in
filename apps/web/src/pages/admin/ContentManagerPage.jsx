import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, BookOpen, Lock, Shield, RefreshCw, Newspaper, Megaphone,
    Layers, Plus, Trash2, Save, Loader2, CheckCircle, Eye, EyeOff, Calendar, Tag
} from 'lucide-react';
import {
    getPageContent, updatePageContent,
    getBlogPosts, addBlogPost, updateBlogPost, deleteBlogPost,
    getSiteSettings, updateSiteSettings
} from '@/lib/siteSettings';

const Label = ({ children }) => <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{children}</label>;
const Input = ({ ...props }) => <input {...props} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />;
const TextArea = ({ rows = 8, ...props }) => <textarea rows={rows} {...props} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all font-mono text-xs resize-y leading-relaxed" />;
const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-1.5">
        <span className="text-white/60 text-sm">{label}</span>
        <button type="button" onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${value ? 'bg-[#d4ff00]' : 'bg-white/10'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform duration-300 ${value ? 'translate-x-5' : ''}`} />
        </button>
    </div>
);
const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={16} />{msg}</motion.div>}</AnimatePresence>
);

const TABS = [
    { id: 'about', label: 'About Page', icon: BookOpen },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'refund', label: 'Refund Policy', icon: RefreshCw },
    { id: 'blog', label: 'Blog Posts', icon: Newspaper },
    { id: 'banner', label: 'Announcement', icon: Megaphone },
    { id: 'popup', label: 'Popup', icon: Layers },
];

const ContentManagerPage = () => {
    const [activeTab, setActiveTab] = useState('about');
    const [pageContents, setPageContents] = useState({});
    const [blogPosts, setBlogPosts] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '' });
    // Blog form
    const [blogForm, setBlogForm] = useState({ title: '', content: '', published: true });
    const [editingPost, setEditingPost] = useState(null);

    useEffect(() => {
        Promise.all([
            Promise.all(['about', 'privacy', 'terms', 'refund'].map(p => getPageContent(p).then(c => [p, c]))),
            getBlogPosts(),
            getSiteSettings(),
        ]).then(([pages, posts, s]) => {
            const contents = {};
            pages.forEach(([k, v]) => { contents[k] = v; });
            setPageContents(contents);
            setBlogPosts(posts);
            setSettings(s);
            setLoading(false);
        });
    }, []);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };
    const setS = (key, value) => setSettings(s => ({ ...s, [key]: value }));

    const savePage = async (key) => {
        setSaving(true);
        try { await updatePageContent(key, pageContents[key] || ''); showToast(`✅ ${key} page saved!`); }
        catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    const saveBannerPopup = async () => {
        setSaving(true);
        try { await updateSiteSettings(settings); showToast('✅ Banner/Popup settings saved!'); }
        catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    const handleBlogSave = async () => {
        setSaving(true);
        try {
            if (editingPost) { await updateBlogPost(editingPost.id, blogForm); }
            else { await addBlogPost(blogForm); }
            const posts = await getBlogPosts();
            setBlogPosts(posts);
            setBlogForm({ title: '', content: '', published: true });
            setEditingPost(null);
            showToast('✅ Blog post saved!');
        } catch { showToast('❌ Save failed', 'error'); }
        setSaving(false);
    };

    const handleBlogDelete = async (id) => {
        if (!confirm('Delete this blog post?')) return;
        await deleteBlogPost(id);
        setBlogPosts(await getBlogPosts());
        showToast('✅ Post deleted');
    };

    const startEdit = (post) => { setEditingPost(post); setBlogForm({ title: post.title, content: post.content, published: post.published }); };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#d4ff00] animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Content Manager</h1>
                <p className="text-white/25 text-xs mt-1">Edit all website pages, blog posts, and notifications</p>
            </div>

            {/* Tab Bar */}
            <div className="flex flex-wrap gap-2 mb-8">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${activeTab === tab.id ? 'bg-[#d4ff00]/10 border-[#d4ff00]/40 text-[#d4ff00]' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60'}`}>
                        <tab.icon size={13} />{tab.label}
                    </button>
                ))}
            </div>

            {/* Page Content Editors */}
            {['about', 'privacy', 'terms', 'refund'].includes(activeTab) && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-white/40 text-sm">Edit the <span className="text-white capitalize">{activeTab}</span> page content below. Supports plain text or HTML.</p>
                        <motion.button onClick={() => savePage(activeTab)} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl disabled:opacity-50">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                        </motion.button>
                    </div>
                    <TextArea rows={20} value={pageContents[activeTab] || ''} onChange={e => setPageContents(p => ({ ...p, [activeTab]: e.target.value }))}
                        placeholder={`Enter your ${activeTab} page content here... (supports plain text or HTML)`} />
                    <p className="text-white/15 text-xs mt-2">{(pageContents[activeTab] || '').length} characters · Supports HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;</p>
                </div>
            )}

            {/* Blog */}
            {activeTab === 'blog' && (
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Blog Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                            <h3 className="text-white font-semibold text-sm mb-4">{editingPost ? '✏️ Edit Post' : '➕ New Post'}</h3>
                            <div className="space-y-3">
                                <div><Label>Title</Label><Input value={blogForm.title} onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title..." /></div>
                                <div><Label>Content</Label><TextArea rows={8} value={blogForm.content} onChange={e => setBlogForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your blog post content here..." /></div>
                                <Toggle value={blogForm.published} onChange={v => setBlogForm(f => ({ ...f, published: v }))} label="Published" />
                                <div className="flex gap-2 pt-2">
                                    {editingPost && <button onClick={() => { setEditingPost(null); setBlogForm({ title: '', content: '', published: true }); }} className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-white/[0.08] text-white/40 hover:text-white/60">Cancel</button>}
                                    <motion.button onClick={handleBlogSave} disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-2.5 bg-[#d4ff00] text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} {editingPost ? 'Update' : 'Publish'}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Blog List */}
                    <div className="lg:col-span-3 space-y-3">
                        {blogPosts.length === 0 ? (
                            <div className="border border-dashed border-white/[0.08] rounded-2xl p-12 text-center">
                                <Newspaper size={32} className="text-white/10 mx-auto mb-3" />
                                <p className="text-white/20 text-sm">No blog posts yet. Create your first one!</p>
                            </div>
                        ) : blogPosts.map(post => (
                            <div key={post.id} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all">
                                <div className={`mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${post.published ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-white/[0.04] border border-white/[0.08] text-white/25'}`}>
                                    {post.published ? 'Live' : 'Draft'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{post.title}</p>
                                    <p className="text-white/25 text-xs mt-0.5 line-clamp-2">{post.content?.substring(0, 120)}...</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => startEdit(post)} className="p-2 rounded-lg border border-white/[0.06] text-white/25 hover:text-[#d4ff00] hover:border-[#d4ff00]/20 transition-all"><Eye size={13} /></button>
                                    <button onClick={() => handleBlogDelete(post.id)} className="p-2 rounded-lg border border-white/[0.06] text-white/25 hover:text-red-400 hover:border-red-400/20 transition-all"><Trash2 size={13} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Announcement Banner */}
            {activeTab === 'banner' && settings && (
                <div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <Toggle value={settings.announcementEnabled} onChange={v => setS('announcementEnabled', v)} label="Show Announcement Banner" />
                        <div><Label>Banner Text</Label><Input value={settings.announcementText} onChange={e => setS('announcementText', e.target.value)} placeholder="🔥 Limited time offer..." /></div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1"><Label>Banner Color</Label>
                                <div className="flex gap-3 items-center">
                                    <input type="color" value={settings.announcementColor || '#E2F034'} onChange={e => setS('announcementColor', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                                    <Input value={settings.announcementColor} onChange={e => setS('announcementColor', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        {settings.announcementEnabled && (
                            <div className="p-3 rounded-xl text-center text-sm font-semibold" style={{ background: settings.announcementColor + '20', borderColor: settings.announcementColor + '40', color: settings.announcementColor, border: '1px solid' }}>
                                Preview: {settings.announcementText}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end mt-4">
                        <motion.button onClick={saveBannerPopup} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl disabled:opacity-50">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Banner
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Popup */}
            {activeTab === 'popup' && settings && (
                <div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <Toggle value={settings.popupEnabled} onChange={v => setS('popupEnabled', v)} label="Show Exit-Intent Popup" />
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Popup Title</Label><Input value={settings.popupTitle} onChange={e => setS('popupTitle', e.target.value)} /></div>
                            <div><Label>Delay (seconds)</Label><Input type="number" min={0} value={settings.popupDelay} onChange={e => setS('popupDelay', Number(e.target.value))} /></div>
                        </div>
                        <div><Label>Popup Message</Label><TextArea rows={3} value={settings.popupMessage} onChange={e => setS('popupMessage', e.target.value)} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>CTA Button Text</Label><Input value={settings.popupCtaText} onChange={e => setS('popupCtaText', e.target.value)} /></div>
                            <div><Label>CTA Button Link</Label><Input value={settings.popupCtaLink} onChange={e => setS('popupCtaLink', e.target.value)} /></div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <motion.button onClick={saveBannerPopup} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#d4ff00] text-black font-bold text-sm rounded-xl disabled:opacity-50">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Popup
                        </motion.button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentManagerPage;

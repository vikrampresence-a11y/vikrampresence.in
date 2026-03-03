import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Upload, Copy, Trash2, CheckCircle, Loader2, FolderOpen } from 'lucide-react';

// ═══════════════════════════════════════════════
// MEDIA LIBRARY — Upload & Manage Images
// ═══════════════════════════════════════════════

const isShopDomain = typeof window !== 'undefined' && window.location.hostname.includes('vikrampresence.shop');
const UPLOAD_URL = isShopDomain ? '/api/upload-image.php' : null;
const LS_KEY = 'vp_media_library';

const getStoredMedia = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
const saveMedia = (items) => { try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { } };

const Toast = ({ msg, type }) => (
    <AnimatePresence>{msg && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold shadow-2xl ${type === 'success' ? 'bg-[#d4ff00] text-black' : 'bg-red-500 text-white'}`}><CheckCircle size={15} />{msg}</motion.div>}</AnimatePresence>
);

const MediaLibraryPage = () => {
    const [media, setMedia] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ msg: '' });
    const [copiedId, setCopiedId] = useState(null);
    const [pasteUrl, setPasteUrl] = useState('');
    const [pastelabel, setPasteLabel] = useState('');

    useEffect(() => setMedia(getStoredMedia()), []);
    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '' }), 3000); };

    const addToLibrary = (url, name = '') => {
        const item = { id: Date.now().toString(), url, name: name || url.split('/').pop() || 'image', addedAt: new Date().toISOString() };
        const updated = [item, ...media];
        setMedia(updated); saveMedia(updated);
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        for (const file of files) {
            const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
            if (!allowed.includes(file.type)) { showToast(`${file.name}: invalid type`, 'error'); continue; }
            if (file.size > 5 * 1024 * 1024) { showToast(`${file.name}: too large (max 5MB)`, 'error'); continue; }
            if (UPLOAD_URL) {
                try {
                    const fd = new FormData(); fd.append('image', file);
                    const res = await fetch(UPLOAD_URL, { method: 'POST', body: fd });
                    const data = await res.json();
                    if (data.success && data.url) addToLibrary(data.url, file.name);
                    else showToast(data.error || `Failed: ${file.name}`, 'error');
                } catch { showToast(`Upload failed: ${file.name}`, 'error'); }
            } else {
                // Dev/local — use data URL
                await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => { addToLibrary(reader.result, file.name); resolve(); };
                    reader.readAsDataURL(file);
                });
            }
        }
        setUploading(false);
        showToast(`✅ ${files.length} image(s) added!`);
        e.target.value = '';
    };

    const handlePasteUrl = () => {
        if (!pasteUrl.trim()) return;
        addToLibrary(pasteUrl.trim(), pastelabel || pasteUrl.split('/').pop());
        setPasteUrl(''); setPasteLabel('');
        showToast('✅ Image URL added');
    };

    const copyUrl = (id, url) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            showToast('✅ URL copied!');
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const deleteMedia = (id) => {
        const updated = media.filter(m => m.id !== id);
        setMedia(updated); saveMedia(updated);
        showToast('✅ Removed');
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <Toast msg={toast.msg} type={toast.type} />
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Media Library</h1>
                <p className="text-white/25 text-xs mt-1">Upload and manage all your images — get copy-ready URLs instantly</p>
            </div>

            {/* Upload Area */}
            <div className="mb-8 grid md:grid-cols-2 gap-6">
                {/* Drag & Drop */}
                <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-white/[0.1] hover:border-[#d4ff00]/30 rounded-2xl p-10 text-center transition-all hover:bg-white/[0.02]">
                        {uploading ? <Loader2 size={32} className="text-[#d4ff00] animate-spin mx-auto mb-3" /> : <Upload size={32} className="text-white/20 mx-auto mb-3" />}
                        <p className="text-white/50 text-sm font-semibold">{uploading ? 'Uploading...' : 'Click to upload images'}</p>
                        <p className="text-white/20 text-xs mt-1">JPG, PNG, WebP, GIF, SVG · Max 5MB each · Multiple allowed</p>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                </label>

                {/* Paste URL */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <p className="text-white/60 text-sm font-semibold mb-4">Or Add by URL</p>
                    <div className="space-y-3">
                        <input value={pastelabel} onChange={e => setPasteLabel(e.target.value)} placeholder="Label (optional)" className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />
                        <input value={pasteUrl} onChange={e => setPasteUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePasteUrl()} placeholder="https://..." className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/15 focus:outline-none focus:border-[#d4ff00]/40 transition-all" />
                        <button onClick={handlePasteUrl} className="w-full py-2.5 bg-[#d4ff00]/10 border border-[#d4ff00]/20 text-[#d4ff00] rounded-xl text-sm font-bold hover:bg-[#d4ff00]/20 transition-all cursor-pointer">Add URL</button>
                    </div>
                </div>
            </div>

            {/* Library Grid */}
            {media.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl">
                    <FolderOpen size={36} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/20 text-sm">No images yet. Upload or add a URL above.</p>
                </div>
            ) : (
                <div>
                    <p className="text-white/25 text-xs mb-4">{media.length} images in library</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <AnimatePresence>
                            {media.map(item => (
                                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative rounded-xl overflow-hidden border border-white/[0.06] aspect-square bg-white/[0.02] hover:border-[#d4ff00]/20 transition-all">
                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-2">
                                        <p className="text-white/70 text-[9px] text-center truncate w-full px-1">{item.name}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => copyUrl(item.id, item.url)} className={`p-2 rounded-lg transition-all cursor-pointer ${copiedId === item.id ? 'bg-[#d4ff00] text-black' : 'bg-white/10 text-white hover:bg-[#d4ff00]/20 hover:text-[#d4ff00]'}`}>
                                                {copiedId === item.id ? <CheckCircle size={13} /> : <Copy size={13} />}
                                            </button>
                                            <button onClick={() => deleteMedia(item.id)} className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};
export default MediaLibraryPage;

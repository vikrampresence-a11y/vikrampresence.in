import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Book } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';

const EbookUploader = () => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                toast({ title: "Invalid file type", description: "Only PDF files are allowed.", variant: "destructive" });
                return;
            }
            if (selectedFile.size > 100 * 1024 * 1024) {
                toast({ title: "File too large", description: "Maximum file size is 100MB", variant: "destructive" });
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            toast({ title: "Missing file", description: "Please select a PDF file to upload.", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('ebook', file);

            const response = await apiServerClient.post('/ebooks/upload-ebook', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast({ title: "Success", description: "Ebook uploaded successfully." });
            setFile(null);

            // Note: Since this uploads directly to the /public directory on the server, 
            // the file might not appear in a database list instantly without further integration, 
            // but the admin successfully placed the file!
        } catch (error) {
            console.error("Upload error:", error);
            const errMsg = error.response?.data?.error || error.message || "Failed to upload ebook.";
            toast({ title: "Upload failed", description: errMsg, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 mt-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-[50px] rounded-full pointer-events-none"></div>

            <h3 className="text-xl font-bold text-[#FFD700] mb-2 flex items-center">
                <Book className="mr-2" size={20} />
                Direct Ebook Upload
            </h3>
            <p className="text-gray-400 text-sm mb-6">Upload an ebook directly to the website's public/ebooks storage.</p>

            <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-[#FFD700]/30 rounded-xl p-8 text-center hover:border-[#FFD700]/60 transition-colors cursor-pointer relative bg-black/50">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                    />
                    <Upload className={`mx-auto mb-4 ${file ? 'text-[#FFD700]' : 'text-gray-500'}`} size={32} />
                    <p className={`text-sm font-medium ${file ? 'text-white' : 'text-gray-300'}`}>
                        {file ? file.name : 'Select or drag & drop Ebook PDF'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">.pdf files up to 100MB</p>
                </div>

                <button
                    type="submit"
                    disabled={isUploading || !file}
                    className="w-full bg-[#FFD700] text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed flex justify-center items-center shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                >
                    {isUploading ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Upload Ebook to Server'}
                </button>
            </form>
        </div>
    );
};

export default EbookUploader;

import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Upload, File, Trash2, Loader2 } from 'lucide-react';

const FileUploadManager = () => {
  const [files, setFiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const [uploadData, setUploadData] = useState({
    productId: '',
    fileType: 'pdf',
    file: null
  });

  const fetchData = async () => {
    try {
      const [filesRes, productsRes] = await Promise.all([
        pb.collection('product_files').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('products').getFullList({ sort: 'title', $autoCancel: false })
      ]);
      setFiles(filesRes);
      setProducts(productsRes);
    } catch (error) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum file size is 100MB", variant: "destructive" });
        return;
      }
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.productId) {
      toast({ title: "Missing fields", description: "Please select a product and a file", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('productId', uploadData.productId);
      formData.append('fileName', uploadData.file.name);
      formData.append('fileType', uploadData.fileType);
      formData.append('file', uploadData.file);

      await pb.collection('product_files').create(formData, { $autoCancel: false });
      toast({ title: "File uploaded successfully" });
      setUploadData({ ...uploadData, file: null });
      fetchData();
    } catch (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this file?')) {
      try {
        await pb.collection('product_files').delete(id, { $autoCancel: false });
        toast({ title: "File deleted" });
        fetchData();
      } catch (error) {
        toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      }
    }
  };

  const getProductName = (id) => {
    const p = products.find(p => p.id === id);
    return p ? p.title : 'Unknown Product';
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FFD700]" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Upload New File</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Product</label>
              <select 
                value={uploadData.productId} 
                onChange={(e) => setUploadData({...uploadData, productId: e.target.value})}
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] outline-none"
                required
              >
                <option value="">-- Select Product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">File Type</label>
              <select 
                value={uploadData.fileType} 
                onChange={(e) => setUploadData({...uploadData, fileType: e.target.value})}
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] outline-none"
              >
                <option value="pdf">PDF Document</option>
                <option value="audio">Audio File</option>
                <option value="video">Video File</option>
              </select>
            </div>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#FFD700] transition-colors cursor-pointer relative">
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <Upload className="mx-auto mb-4 text-gray-400" size={32} />
              <p className="text-sm text-gray-300">
                {uploadData.file ? uploadData.file.name : 'Drag & drop or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Max size: 100MB</p>
            </div>
            <button 
              type="submit" 
              disabled={isUploading || !uploadData.file}
              className="w-full bg-[#FFD700] text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex justify-center items-center"
            >
              {isUploading ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Upload File'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">Uploaded Files</h3>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {files.map(file => (
              <div key={file.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400">
                    <File size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{file.fileName}</p>
                    <p className="text-xs text-gray-500">{getProductName(file.productId)} • {file.fileType.toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(file.id)} className="text-gray-500 hover:text-red-400 transition-colors p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {files.length === 0 && (
              <div className="p-8 text-center text-gray-500">No files uploaded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadManager;

import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'ebook',
    googleDriveLink: '',
    active: true
  });

  const fetchProducts = async () => {
    try {
      const records = await pb.collection('products').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setProducts(records);
    } catch (error) {
      toast({ title: "Error fetching products", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        type: product.type,
        googleDriveLink: product.googleDriveLink || '',
        active: product.active
      });
    } else {
      setEditingProduct(null);
      setFormData({ title: '', description: '', price: '', type: 'ebook', googleDriveLink: '', active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: Number(formData.price)
      };

      if (editingProduct) {
        await pb.collection('products').update(editingProduct.id, data, { $autoCancel: false });
        toast({ title: "Product updated successfully", style: { backgroundColor: '#FFD700', color: '#000000' } });
      } else {
        await pb.collection('products').create(data, { $autoCancel: false });
        toast({ title: "Product created successfully", style: { backgroundColor: '#FFD700', color: '#000000' } });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast({ title: "Error saving product", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await pb.collection('products').delete(id, { $autoCancel: false });
        toast({ title: "Product deleted successfully" });
        fetchProducts();
      } catch (error) {
        toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
      }
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FFD700]" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Products Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#FFD700] text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(255,215,0,0.2)]"
        >
          <Plus size={16} className="mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-gray-300 border-b border-white/10">
            <tr>
              <th className="px-6 py-5">Title</th>
              <th className="px-6 py-5">Type</th>
              <th className="px-6 py-5">Price</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{product.title}</td>
                <td className="px-6 py-4 uppercase text-xs tracking-wider">{product.type}</td>
                <td className="px-6 py-4 font-bold text-[#FFD700]">₹{product.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button onClick={() => handleOpenModal(product)} className="text-gray-400 hover:text-[#FFD700] transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <h3 className="text-2xl font-bold text-white mb-8">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] outline-none transition-colors h-24 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] outline-none transition-colors" required min="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] outline-none transition-colors">
                    <option value="ebook">Ebook</option>
                    <option value="course">Course</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Google Drive Delivery Link</label>
                <input type="url" value={formData.googleDriveLink} onChange={(e) => setFormData({ ...formData, googleDriveLink: e.target.value })} placeholder="https://drive.google.com/..." className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] outline-none transition-colors" required />
              </div>
              <div className="flex items-center mt-6 bg-white/5 p-4 rounded-xl border border-white/10">
                <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="mr-3 w-4 h-4 accent-[#FFD700]" />
                <label htmlFor="active" className="text-sm text-white font-medium">Active (Visible to public)</label>
              </div>
              <div className="flex justify-end space-x-4 mt-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="bg-[#FFD700] text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(255,215,0,0.2)]">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;

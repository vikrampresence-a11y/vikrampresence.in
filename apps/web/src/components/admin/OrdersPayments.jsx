import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search } from 'lucide-react';

const OrdersPayments = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const records = await pb.collection('orders').getFullList({
          sort: '-created',
          $autoCancel: false
        });
        setOrders(records);
      } catch (error) {
        toast({ title: "Error fetching orders", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.paymentStatus === filter;
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FFD700]" /></div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-white">Orders & Payments</h2>
        <div className="flex space-x-2">
          {['all', 'completed', 'pending', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                filter === status ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs uppercase tracking-widest text-gray-300 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 text-white">{order.productTitle || order.productId}</td>
                  <td className="px-6 py-4 font-bold text-white">₹{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.paymentStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                      order.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{new Date(order.created).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPayments;
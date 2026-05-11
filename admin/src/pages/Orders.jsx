import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Loader2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const statusMap = {
    PENDING: { label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    PAID: { label: 'Paid', icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-100' },
    PROCESSING: { label: 'Processing', icon: RefreshCw, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-100' },
    FAILED: { label: 'Failed', icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Fulfillment</h1>
          <p className="text-slate-500 text-sm">Monitor sales and manage the delivery lifecycle.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-primary-200">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
             {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map(s => (
               <button 
                 key={s}
                 onClick={() => setFilter(s)}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                   filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                 }`}
               >
                 {s}
               </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const status = statusMap[order.status] || { label: order.status, icon: Clock, color: 'bg-slate-100' };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">#{order.orderNumber}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{order.id.slice(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs">
                            {(order.user?.firstName || 'C')[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{order.user?.firstName} {order.user?.lastName}</p>
                            <p className="text-[10px] text-slate-500">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider w-fit ${status.color}`}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <button className="p-2 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="View Details">
                             <Eye className="w-4 h-4" />
                           </button>
                           {order.status === 'PAID' && (
                             <button 
                               onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                               className="p-2 bg-indigo-50 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all" 
                               title="Mark as Shipped"
                             >
                               <Truck className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, Package, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:3000/orders');
        setOrders(res.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2">My Orders</h1>
          <p className="text-gray-400">Track and view your previous orders</p>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="glass rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors animate-slide-up">
              <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-gray-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Order #{order.id}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${
                    order.status === 'completed' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                  }`}>
                    {order.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    <span className="capitalize">{order.status}</span>
                  </div>
                  <span className="text-2xl font-black gradient-text">₹{order.total_price.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Items Ordered</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-darker p-3 rounded-xl border border-gray-800">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm font-bold text-primary">
                        {item.quantity}x
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gray-400">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-3xl border border-gray-800">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
          <p className="text-gray-500">Looks like you haven't placed any orders.</p>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

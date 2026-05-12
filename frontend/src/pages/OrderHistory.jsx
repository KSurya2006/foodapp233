import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, Package, ChefHat, Bike, ClipboardList, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../firebase';
import { motion } from 'framer-motion';

const ORDER_STATUSES = ['pending', 'preparing', 'out_for_delivery', 'completed'];

const OrderTimeline = ({ currentStatus }) => {
  const currentIndex = ORDER_STATUSES.indexOf(currentStatus) === -1 ? 0 : ORDER_STATUSES.indexOf(currentStatus);

  const steps = [
    { id: 'pending', label: 'Placed', icon: ClipboardList },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'out_for_delivery', label: 'On Way', icon: Bike },
    { id: 'completed', label: 'Delivered', icon: CheckCircle2 },
  ];

  return (
    <div className="mt-6 mb-2">
      <div className="relative flex justify-between items-center w-full">
        {/* Track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-800 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-primary to-orange-400 rounded-full z-0 transition-all duration-700"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div 
                animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isActive 
                    ? 'bg-primary border-primary/30 text-white shadow-lg shadow-primary/20' 
                    : 'bg-darker border-gray-800 text-gray-600'
                }`}
              >
                <step.icon className="w-3.5 h-3.5" />
              </motion.div>
              <span className={`text-[9px] md:text-[10px] font-bold absolute -bottom-5 whitespace-nowrap ${
                isActive ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const user_id = auth.currentUser?.uid;
      if (!user_id) {
        toast.error('User not authenticated');
        return;
      }
      const res = await axios.get(`https://foodapp233.onrender.com/orders?user_id=${user_id}`);
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 md:px-12 py-6 max-w-3xl mx-auto">
        <div className="h-8 w-32 bg-surface shimmer rounded-lg mb-2"></div>
        <div className="h-4 w-48 bg-surface shimmer rounded-lg mb-6"></div>
        {[1,2,3].map(n => (
          <div key={n} className="bg-surface rounded-2xl p-6 border border-gray-800/40 mb-4 shimmer h-48"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black mb-1">My Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9, rotate: 180 }}
          onClick={() => { setLoading(true); fetchOrders(); }}
          className="p-2.5 rounded-xl bg-surface border border-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              key={order.id} 
              className="bg-surface rounded-2xl border border-gray-800/40 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Order #{order.id}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-400 border border-gray-700/40">
                      {order.payment_method === 'cod' ? '💵 COD' : '💳 Online'}
                    </span>
                    <span className="text-xl font-black gradient-text">₹{order.total_price?.toFixed(0)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {order.items && order.items.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1 bg-darker px-2 py-1 rounded-lg text-[10px] border border-gray-800/40">
                      <span className="font-bold text-primary">{item.quantity}x</span>
                      <span className="text-gray-400">{item.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tracking */}
              <div className="bg-darker/50 px-5 pt-2 pb-8 border-t border-gray-800/30">
                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 text-center">Tracking</h4>
                <OrderTimeline currentStatus={order.status} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-2xl border border-gray-800/40">
          <div className="w-16 h-16 rounded-2xl bg-darker flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-700" />
          </div>
          <h3 className="text-lg font-bold mb-1">No orders yet</h3>
          <p className="text-sm text-gray-500">Your order history will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

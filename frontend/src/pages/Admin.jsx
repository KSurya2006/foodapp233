import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Image as ImageIcon, DollarSign, Type, LayoutGrid, CheckCircle, Clock, Package, TrendingUp, ShoppingBag, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('add_food');

  // Food Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Burger',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image_url) {
      return toast.error('Please fill all fields');
    }

    setLoading(true);
    try {
      await axios.post('https://foodapp233.onrender.com/admin/food', {
        ...formData,
        price: parseFloat(formData.price)
      }, {
        headers: { 'x-admin-token': 'true' }
      });
      toast.success('Food item added! 🎉');
      setFormData({ name: '', price: '', category: 'Burger', image_url: '' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add food item');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get('https://foodapp233.onrender.com/orders', {
        headers: { 'x-admin-token': 'true' }
      });
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`https://foodapp233.onrender.com/admin/orders/${id}/status`, { status }, {
        headers: { 'x-admin-token': 'true' }
      });
      toast.success(`Order #${id} → ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'badge-pending';
      case 'preparing': return 'badge-preparing';
      case 'out_for_delivery': return 'badge-delivery';
      case 'completed': return 'badge-completed';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
            Dashboard
            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded-md uppercase tracking-wider font-bold border border-red-500/20">
              Admin
            </span>
          </h1>
          <p className="text-sm text-gray-500">Manage menu items and customer orders</p>
        </div>

        <div className="flex bg-surface p-1 rounded-xl border border-gray-800/60">
          <button
            onClick={() => setActiveTab('add_food')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'add_food' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Add Food
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
              activeTab === 'orders' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Orders
            {pendingOrders.length > 0 && activeTab !== 'orders' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[9px] font-bold rounded-full flex items-center justify-center text-white animate-pulse-soft">
                {pendingOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'add_food' ? (
          <motion.div 
            key="add_food"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-surface rounded-2xl p-6 md:p-8 border border-gray-800/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[60px] rounded-full pointer-events-none"></div>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {/* Food Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Food Name</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Double Cheese Margherita"
                      className="input-premium pl-11"
                      required
                    />
                  </div>
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price (₹)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="12.99"
                        className="input-premium pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                    <div className="relative">
                      <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input-premium pl-11 appearance-none"
                      >
                        <option value="Burger">🍔 Burger</option>
                        <option value="Pizza">🍕 Pizza</option>
                        <option value="Drinks">🥤 Drinks</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="input-premium pl-11"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 btn-primary rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Add Food Item
                    </>
                  )}
                </motion.button>
              </form>

              {/* Image Preview */}
              {formData.image_url && (
                <div className="mt-6 pt-6 border-t border-gray-800/40">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Preview</h4>
                  <div className="w-full h-40 rounded-xl overflow-hidden border border-gray-800/40">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image'}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-surface rounded-xl p-4 border border-gray-800/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total</span>
                </div>
                <p className="text-2xl font-black">{orders.length}</p>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-gray-800/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pending</span>
                </div>
                <p className="text-2xl font-black text-amber-400">{pendingOrders.length}</p>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-gray-800/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Done</span>
                </div>
                <p className="text-2xl font-black text-emerald-400">{completedOrders.length}</p>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-gray-800/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-violet-500/10 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Revenue</span>
                </div>
                <p className="text-2xl font-black text-violet-400">
                  ₹{orders.reduce((sum, o) => sum + (o.total_price || 0), 0).toFixed(0)}
                </p>
              </div>
            </div>

            {/* Filter + Refresh */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {['all', 'pending', 'completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                      filterStatus === status
                        ? 'bg-primary text-white'
                        : 'bg-surface border border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={fetchOrders}
                className="p-2 rounded-lg bg-surface border border-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Orders List */}
            {loadingOrders ? (
              <div className="space-y-3">
                {[1,2,3].map(n => (
                  <div key={n} className="bg-surface rounded-xl p-5 border border-gray-800/40 shimmer h-32"></div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-2xl border border-gray-800/40">
                <Package className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-1">No orders found</h3>
                <p className="text-sm text-gray-500">Waiting for customers to order.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredOrders.map(order => (
                    <motion.div 
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-surface rounded-xl border border-gray-800/40 hover:border-gray-700/40 transition-colors overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                            #{order.id}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm">{order.user_phone}</h3>
                            <p className="text-[11px] text-gray-500 truncate max-w-[200px]">{order.user_name}</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">
                              {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-xl font-black gradient-text">₹{order.total_price?.toFixed(0)}</span>

                          {order.status === 'pending' && (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Accept
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="px-4 pb-4">
                        <div className="flex flex-wrap gap-2">
                          {order.items && order.items.map((item, idx) => (
                            <span key={idx} className="flex items-center gap-1.5 bg-darker px-2.5 py-1.5 rounded-lg text-[11px] border border-gray-800/40">
                              <span className="font-bold text-primary">{item.quantity}x</span>
                              <span className="text-gray-300">{item.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;

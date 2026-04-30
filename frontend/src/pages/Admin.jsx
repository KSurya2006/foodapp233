import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Image as ImageIcon, DollarSign, Type, LayoutGrid, CheckCircle, Clock, Package } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image_url) {
      return toast.error('Please fill all fields');
    }

    setLoading(true);
    try {
      await axios.post('https://foodapp233.onrender.com/admin', {
        ...formData,
        price: parseFloat(formData.price)
      });
      toast.success('Food item added successfully!');
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
      const res = await axios.get('https://foodapp233.onrender.com/orders');
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
      await axios.put(`http://localhost:3000/admin/orders/${id}/status`, { status });
      toast.success(`Order #${id} marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="px-6 md:px-12 py-8 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            Admin Dashboard <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-md uppercase tracking-widest font-bold">Secure</span>
          </h1>
          <p className="text-gray-400">Manage your menu and orders.</p>
        </div>
        
        <div className="flex bg-darker p-1 rounded-xl border border-gray-800">
          <button 
            onClick={() => setActiveTab('add_food')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'add_food' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400 hover:text-white'}`}
          >
            Add Food
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400 hover:text-white'}`}
          >
            Manage Orders
          </button>
        </div>
      </div>

      {activeTab === 'add_food' ? (
        <div className="max-w-3xl mx-auto glass rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Food Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Double Cheese Margherita"
                    className="w-full pl-11 pr-4 py-3 bg-darker/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Price (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="12.99"
                      className="w-full pl-11 pr-4 py-3 bg-darker/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Category</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LayoutGrid className="h-5 w-5 text-gray-500" />
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-darker/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                    >
                      <option value="Burger">Burger</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Drinks">Drinks</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Image URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-11 pr-4 py-3 bg-darker/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Adding Item...' : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Add Food Item
                </>
              )}
            </button>
          </form>

          {/* Image Preview */}
          {formData.image_url && (
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Image Preview</h4>
              <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-800 relative">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL'}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {loadingOrders ? (
             <div className="flex justify-center py-20">
               <div className="w-12 h-12 border-4 border-gray-800 border-t-primary rounded-full animate-spin"></div>
             </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-gray-800">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No active orders</h3>
              <p className="text-gray-500">Wait for customers to place new orders.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="glass rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-gray-800 pb-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                      #{order.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{order.user_phone}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400 mb-1">Total Amount</span>
                      <span className="text-2xl font-black gradient-text">₹{order.total_price.toFixed(2)}</span>
                    </div>
                    
                    {order.status === 'pending' ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all ml-4"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept Order
                      </button>
                    ) : (
                      <div className="px-6 py-3 bg-darker border border-gray-800 text-gray-400 rounded-xl font-bold flex items-center gap-2 ml-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Completed
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-darker p-3 rounded-xl border border-gray-800">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm font-bold text-primary">
                        {item.quantity}x
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gray-400">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;

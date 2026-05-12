import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon, MapPin, Heart, Shield, ChevronRight, ShoppingBag, Clock, Star, Settings } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [isAdmin, setIsAdmin] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('adminToken') === 'true');
    
    // Fetch order count
    const fetchStats = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const res = await axios.get(`https://foodapp233.onrender.com/orders?user_id=${uid}`);
          setOrderCount(res.data.length);
        }
      } catch (e) {
        // silently fail
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('adminToken');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', subtitle: `${orderCount} orders placed`, action: () => navigate('/orders') },
    { icon: MapPin, label: 'Saved Addresses', subtitle: 'Manage delivery locations', action: () => toast('Coming soon!') },
    { icon: Heart, label: 'Favorite Foods', subtitle: 'Your liked items', action: () => toast('Coming soon!') },
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Dashboard', subtitle: 'Manage menu & orders', action: () => navigate('/admin') }] : [])
  ];

  // Generate avatar initials
  const phone = user?.phoneNumber || '?';
  const initials = phone.slice(-2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 sm:px-6 py-6 max-w-2xl mx-auto page-enter"
    >
      <h1 className="text-2xl font-black mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-surface border border-gray-800/60 rounded-2xl p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-primary/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">Foodie</h2>
            <p className="text-sm text-gray-400 mt-0.5 truncate">{user?.phoneNumber || 'No phone linked'}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg border border-primary/20">
                {isAdmin ? '🛡️ Admin' : '⭐ Premium'}
              </span>
              <span className="text-[10px] text-gray-500">Member since 2026</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-800/40">
          <div className="text-center">
            <p className="text-xl font-black gradient-text">{orderCount}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-emerald-400">4.8</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Avg Rating</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-violet-400">₹0</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Saved</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2 mb-6">
        {menuItems.map((item, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.98 }}
            onClick={item.action}
            className="w-full bg-surface border border-gray-800/60 rounded-xl p-4 flex items-center justify-between hover:border-gray-700/60 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-darker rounded-xl border border-gray-800/40 group-hover:border-primary/20 transition-colors">
                <item.icon className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-sm text-white block">{item.label}</span>
                <span className="text-[11px] text-gray-500">{item.subtitle}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
          </motion.button>
        ))}
      </div>

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="w-full bg-red-500/5 border border-red-500/10 text-red-400 rounded-xl p-4 flex items-center justify-center gap-3 font-semibold text-sm hover:bg-red-500/10 hover:border-red-500/20 transition-all"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </motion.button>

      {/* App Info */}
      <div className="text-center mt-8">
        <p className="text-[10px] text-gray-600">FoodApp Premium v2.0</p>
        <p className="text-[10px] text-gray-700 mt-0.5">Made with ❤️ in India</p>
      </div>
    </motion.div>
  );
};

export default Profile;

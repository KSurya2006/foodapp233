import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, LogOut, ShieldAlert, X, Sparkles } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useCart } from '../store/CartContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ user, isAdminView = false }) => {
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleLogout = async () => {
    try {
      if (isAdminView) {
        localStorage.removeItem('adminToken');
        toast.success('Exited Admin Portal');
        navigate('/');
      } else {
        await signOut(auth);
        localStorage.removeItem('mockUser');
        toast.success('Logged out successfully');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-40 w-full transition-all duration-500 ${
        scrolled 
          ? 'glass py-3 shadow-lg shadow-black/20' 
          : 'bg-dark/80 backdrop-blur-sm py-4'
      } px-4 sm:px-6 md:px-12 ${isAdminView ? 'border-b border-red-500/20' : ''}`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to={isAdminView ? '/admin' : '/'} className="flex items-center gap-2.5 group">
          {isAdminView ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
          ) : (
            <motion.div 
              whileHover={{ rotate: 12, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <span className="text-xl font-black text-white">F</span>
            </motion.div>
          )}
          <span className="text-lg font-extrabold tracking-tight hidden sm:block">
            {isAdminView ? (
              <>Admin<span className="text-red-500">Portal</span></>
            ) : (
              <>Food<span className="gradient-text">GPT</span></>
            )}
          </span>
        </Link>

        {/* Desktop Search */}
        {!isAdminView && (
          <div className="flex-1 max-w-lg mx-4 md:mx-8 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Ask FoodGPT search or browse dishes..."
                disabled={true}
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('main-search')?.focus();
                  }, 100);
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-surface border border-gray-800 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm placeholder-gray-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Toggle */}
          {!isAdminView && (
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('main-search')?.focus();
                }, 100);
              }}
              className="md:hidden p-2.5 rounded-xl bg-surface border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Nav Links (desktop) */}
          {!isAdminView && (
            <div className="hidden sm:flex items-center gap-2">
              <Link 
                to="/orders" 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/orders' 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-surface'
                }`}
              >
                Orders
              </Link>
              <Link 
                to="/ai" 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/ai' 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-surface'
                }`}
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                FoodGPT AI
              </Link>
            </div>
          )}

          {/* Cart Button */}
          {!isAdminView && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-surface border border-gray-800 hover:border-primary/30 text-gray-300 hover:text-white transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Divider */}
          <div className="w-px h-8 bg-gray-800 mx-1 hidden sm:block"></div>

          {/* User Info + Logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                {isAdminView ? 'Secure Session' : 'Welcome'}
              </span>
              <span className="text-xs font-semibold text-gray-300 truncate max-w-[90px]">
                {isAdminView ? 'Administrator' : (user?.phoneNumber || 'User')}
              </span>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-red-400 hover:text-red-300"
              title={isAdminView ? "Exit Admin Portal" : "Logout"}
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

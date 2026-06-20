import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, User, ShoppingBag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../store/CartContext';

const BottomNav = () => {
  const { totalItems, setIsCartOpen } = useCart();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/ai', icon: Sparkles, label: 'FoodGPT' },
    { type: 'cart', icon: ShoppingBag, label: 'Cart' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 md:hidden z-40 pb-safe"
    >
      {/* Gradient blur effect behind the nav */}
      <div className="absolute inset-0 bg-dark/85 backdrop-blur-xl border-t border-gray-800/50"></div>
      
      <div className="relative flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item, idx) => {
          if (item.type === 'cart') {
            return (
              <button
                key="cart"
                onClick={() => setIsCartOpen(true)}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-gray-400 hover:text-gray-200 relative"
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 relative ${
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'} ${item.to === '/ai' && isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute -bottom-0.5 w-6 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BottomNav;

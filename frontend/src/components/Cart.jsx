import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../store/CartContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { auth } from '../firebase';

const Cart = () => {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, totalPrice, clearCart } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);

  if (!isCartOpen) return null;

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    setIsOrdering(true);
    try {
      const user = auth.currentUser;
      const orderData = {
        items: cartItems,
        total_price: totalPrice,
        user_phone: user?.phoneNumber || 'Guest',
        user_name: 'Customer',
        user_id: user?.uid || 'guest_id'
      };

      await axios.post('http://localhost:3000/order', orderData);
      toast.success('Order placed successfully!');
      clearCart();
      setIsCartOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      ></div>
      
      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-dark border-l border-gray-800 z-50 flex flex-col shadow-2xl transform transition-transform duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between glass">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Your Cart</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p className="text-lg">Your cart is feeling a bit light.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-card p-3 rounded-2xl border border-gray-800 animate-slide-up">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-white truncate pr-2">{item.name}</h4>
                    <span className="text-primary font-bold">₹{item.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 bg-gray-800 rounded-md hover:bg-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 bg-gray-800 rounded-md hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-800 bg-darker">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-3xl font-black gradient-text">₹{totalPrice.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleOrder}
              disabled={isOrdering}
              className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOrdering ? 'Processing...' : 'Order Now'}
              {!isOrdering && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;

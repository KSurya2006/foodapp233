import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2, MapPin, CheckCircle2, FileText, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../store/CartContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [instructions, setInstructions] = useState('');
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  if (!isCartOpen) return null;

  const handleLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success('Location captured!', { icon: '📍' });
          setIsLocating(false);
        },
        (error) => {
          toast.error('Failed to get location. Please allow location access.');
          setIsLocating(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty!');
      return;
    }
    if (!location) {
      toast.error('Please fetch your current location first!');
      return;
    }

    setIsOrdering(true);
    try {
      const user = auth.currentUser;
      const orderData = {
        items: cartItems,
        total_price: totalPrice,
        user_phone: user?.phoneNumber || 'Guest',
        user_name: `Instructions: ${instructions || 'None'} | GPS: ${location.lat},${location.lng}`,
        user_id: user?.uid || 'guest_id',
        payment_method: paymentMethod
      };

      if (paymentMethod === 'cod') {
        await axios.post('https://foodapp233.onrender.com/order', orderData);
        toast.success('Order placed successfully! 🎉', { duration: 4000 });
        clearCart();
        setIsCartOpen(false);
        setIsOrdering(false);
        return;
      }

      // Razorpay Flow
      if (!window.Razorpay) {
        toast.error('Failed to load payment gateway. Please disable adblockers or refresh.');
        setIsOrdering(false);
        return;
      }

      const options = {
        key: 'rzp_test_So5YTBCUuLHHse',
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        name: 'FoodApp Premium',
        description: 'Food Order Payment',
        handler: async function (response) {
          try {
            await axios.post('https://foodapp233.onrender.com/order', orderData);
            toast.success(`Payment successful! 🎉`, { duration: 4000 });
            clearCart();
            setIsCartOpen(false);
          } catch (error) {
            console.error(error);
            toast.error('Payment succeeded but failed to save order.');
          } finally {
            setIsOrdering(false);
          }
        },
        prefill: {
          name: 'Customer',
          contact: user?.phoneNumber || '9999999999',
        },
        theme: {
          color: '#FF4500'
        },
        modal: {
          ondismiss: function() {
            setIsOrdering(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description || 'Payment failed.');
        setIsOrdering(false);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong.');
      setIsOrdering(false);
    }
  };

  const deliveryFee = totalPrice > 200 ? 0 : 30;
  const grandTotal = totalPrice + deliveryFee;

  return (
    <>
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Sidebar */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-dark z-50 flex flex-col shadow-2xl shadow-black/50 border-l border-gray-800/50"
      >
        
        {/* Header */}
        <div className="p-5 border-b border-gray-800/60 flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Your Cart</h2>
              <p className="text-xs text-gray-500">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl bg-surface border border-gray-800 hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-surface border border-gray-800 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-400">Cart is empty</p>
                <p className="text-sm text-gray-600 mt-1">Add some delicious food!</p>
              </div>
              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 bg-surface border border-gray-800 text-white rounded-xl hover:bg-gray-800 transition font-medium text-sm"
              >
                Browse Menu
              </motion.button>
            </div>
          ) : (
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-3 bg-surface p-3 rounded-xl border border-gray-800/60 hover:border-gray-700/60 transition-colors"
                >
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-white truncate">{item.name}</h4>
                      <span className="text-primary font-bold text-sm whitespace-nowrap">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-darker rounded-lg border border-gray-800">
                        <motion.button 
                          whileTap={{ scale: 0.85 }}
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 hover:text-primary transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </motion.button>
                        <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                        <motion.button 
                          whileTap={{ scale: 0.85 }}
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 hover:text-primary transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </motion.button>
                      </div>
                      <motion.button 
                        whileTap={{ scale: 0.85 }}
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-800/60 bg-surface/30 space-y-4">
            
            {/* Location */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Delivery Location
                </h4>
                {location && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Captured
                  </span>
                )}
              </div>
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleLocation}
                className={`w-full py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  location 
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                    : 'border-gray-800 bg-darker text-gray-400 hover:border-primary/30 hover:text-primary'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {isLocating ? 'Locating...' : location ? 'Location Fetched ✓' : 'Get Current Location'}
              </motion.button>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Instructions
              </h4>
              <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Leave at door, ring bell..."
                className="w-full bg-darker border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/40 resize-none h-14 placeholder-gray-600 transition-colors"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</h4>
              <div className="grid grid-cols-2 gap-2">
                <motion.label 
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                    paymentMethod === 'razorpay' 
                      ? 'border-primary/40 bg-primary/5 text-white' 
                      : 'border-gray-800 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="hidden" />
                  <CreditCard className="w-4 h-4" />
                  Pay Online
                </motion.label>
                <motion.label 
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                    paymentMethod === 'cod' 
                      ? 'border-primary/40 bg-primary/5 text-white' 
                      : 'border-gray-800 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                  <Banknote className="w-4 h-4" />
                  Cash
                </motion.label>
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-2 pt-2 border-t border-gray-800/40">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-300">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className={deliveryFee === 0 ? 'text-emerald-400 font-medium' : 'text-gray-300'}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-gray-300">Total</span>
                <span className="text-2xl font-black gradient-text">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Order Button */}
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleOrder}
              disabled={isOrdering}
              className="w-full py-3.5 btn-primary rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOrdering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Place Order — ₹{grandTotal.toFixed(2)}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Cart;

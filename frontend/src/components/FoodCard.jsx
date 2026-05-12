import React from 'react';
import { Plus, Star, Clock } from 'lucide-react';
import { useCart } from '../store/CartContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const FoodCard = ({ food, index = 0 }) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(food);
    toast.success(`${food.name} added to cart!`, {
      icon: '🛒',
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,69,0,0.2)' }
    });
  };

  // Generate a consistent random rating and prep time per food item
  const rating = (4 + ((food.id * 7) % 10) / 10).toFixed(1);
  const prepTime = 15 + ((food.id * 3) % 20);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="bg-card rounded-2xl overflow-hidden shadow-card border border-gray-800/60 hover:border-gray-700/80 transition-all duration-500 group card-hover relative"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent z-10"></div>
        <img 
          src={food.image_url} 
          alt={food.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md rounded-lg border border-white/10 text-gray-200">
            {food.category}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-emerald-500/90 backdrop-blur-md rounded-lg text-white">
            <Star className="w-3 h-3 fill-current" />
            {rating}
          </span>
        </div>

        {/* Quick Add Button (appears on hover) */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleAdd}
          className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* Content */}
      <div className="p-4 pt-2 relative z-20 -mt-3">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-[15px] font-bold text-white leading-tight truncate pr-3 group-hover:text-primary transition-colors">
            {food.name}
          </h3>
          <span className="text-lg font-black gradient-text whitespace-nowrap">₹{food.price}</span>
        </div>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-[11px] text-gray-500">
            <Clock className="w-3 h-3" />
            {prepTime} min
          </span>
          <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
          <span className="text-[11px] text-gray-500">Free delivery</span>
        </div>
        
        {/* Add to Cart Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          className="w-full py-2.5 rounded-xl bg-surface border border-gray-800 hover:bg-primary hover:border-primary text-gray-300 hover:text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FoodCard;

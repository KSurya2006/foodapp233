import React from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../store/CartContext';
import toast from 'react-hot-toast';

const FoodCard = ({ food }) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(food);
    toast.success(`${food.name} added to cart!`);
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 group hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10"></div>
        <img 
          src={food.image_url} 
          alt={food.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 z-20">
          <span className="px-3 py-1 text-xs font-semibold bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            {food.category}
          </span>
        </div>
      </div>
      
      <div className="p-5 relative z-20 -mt-6">
        <div className="flex justify-between items-start mb-2 mt-2">
          <h3 className="text-lg font-bold text-white leading-tight truncate pr-4">{food.name}</h3>
          <span className="text-xl font-black gradient-text">₹{food.price}</span>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          Delicious and freshly prepared {food.name.toLowerCase()} made with premium ingredients.
        </p>
        
        <button 
          onClick={handleAdd}
          className="w-full py-3 rounded-xl bg-gray-800 hover:bg-primary text-white font-medium transition-colors flex items-center justify-center gap-2 group/btn"
        >
          <Plus className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default FoodCard;

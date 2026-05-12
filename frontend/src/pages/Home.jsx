import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodCard from '../components/FoodCard';
import { Flame, Pizza, Coffee, Beef, Sparkles, TrendingUp, Zap, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { id: 'All', name: 'All Items', icon: <Flame className="w-4 h-4" />, emoji: '🔥' },
  { id: 'Burger', name: 'Burgers', icon: <Beef className="w-4 h-4" />, emoji: '🍔' },
  { id: 'Pizza', name: 'Pizza', icon: <Pizza className="w-4 h-4" />, emoji: '🍕' },
  { id: 'Drinks', name: 'Drinks', icon: <Coffee className="w-4 h-4" />, emoji: '🥤' },
];

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axios.get('https://foodapp233.onrender.com/food');
        setFoods(res.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch food items');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const filteredFoods = foods.filter(f => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="px-4 sm:px-6 md:px-12 py-6 max-w-7xl mx-auto page-enter">
        {/* Hero Skeleton */}
        <div className="mb-10 h-56 md:h-64 rounded-2xl bg-surface shimmer"></div>
        
        {/* Categories Skeleton */}
        <div className="flex gap-3 mb-8 overflow-x-hidden">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-11 w-28 bg-surface rounded-xl shimmer"></div>
          ))}
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map((n) => (
            <div key={n} className="bg-surface rounded-2xl overflow-hidden border border-gray-800/40">
              <div className="h-44 shimmer"></div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-800 rounded-lg w-2/3 shimmer"></div>
                  <div className="h-4 bg-gray-800 rounded-lg w-1/4 shimmer"></div>
                </div>
                <div className="h-3 bg-gray-800 rounded-lg w-1/2 shimmer"></div>
                <div className="h-10 bg-gray-800 rounded-xl w-full shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 max-w-7xl mx-auto page-enter">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 relative rounded-2xl overflow-hidden border border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card/80 to-card"></div>
        <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[160%] bg-primary/8 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-40%] left-[-10%] w-[40%] h-[120%] bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 p-6 md:p-10 lg:p-12">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-primary/15 text-primary text-xs font-bold mb-4 border border-primary/20">
                <Sparkles className="w-3 h-3" />
                Fresh & Hot
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-[1.1] tracking-tight"
            >
              Craving something{' '}
              <span className="gradient-text">delicious?</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-sm md:text-base mb-6 max-w-md leading-relaxed"
            >
              Premium food delivered to your doorstep in minutes. Freshly prepared by the best chefs.
            </motion.p>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-6"
            >
              <div>
                <p className="text-2xl font-black gradient-text">{foods.length}+</p>
                <p className="text-[11px] text-gray-500 font-medium">Menu Items</p>
              </div>
              <div className="w-px bg-gray-800"></div>
              <div>
                <p className="text-2xl font-black text-emerald-400">4.8</p>
                <p className="text-[11px] text-gray-500 font-medium">Avg Rating</p>
              </div>
              <div className="w-px bg-gray-800"></div>
              <div>
                <p className="text-2xl font-black text-violet-400">15m</p>
                <p className="text-[11px] text-gray-500 font-medium">Fast Delivery</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Search */}
      <div className="mb-6 md:hidden">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for food..."
            className="w-full pl-11 pr-4 py-3 bg-surface border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-primary/50 placeholder-gray-600 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 no-scrollbar">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap text-sm ${
                activeCategory === cat.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'bg-surface border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-bold">
            {activeCategory === 'All' ? 'Popular Right Now' : activeCategory}
          </h2>
          <span className="text-xs text-gray-500 bg-surface px-2 py-0.5 rounded-full border border-gray-800">
            {filteredFoods.length}
          </span>
        </div>
      </div>

      {/* Food Grid */}
      <AnimatePresence mode="wait">
        {filteredFoods.length > 0 ? (
          <motion.div 
            key={activeCategory + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredFoods.map((food, index) => (
              <FoodCard key={food.id} food={food} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-surface rounded-2xl border border-gray-800/40"
          >
            <div className="inline-block p-5 rounded-2xl bg-darker mb-4">
              <Pizza className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No items found</h3>
            <p className="text-gray-500 text-sm">Try a different category or search term.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

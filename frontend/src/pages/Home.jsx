import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodCard from '../components/FoodCard';
import { Flame, Pizza, Coffee, Beef, Sparkles, TrendingUp, Zap, Search, Info, ShoppingCart, Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import { useCart } from '../store/CartContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../config';

const categories = [
  { id: 'All', name: 'All Items', emoji: '🔥' },
  { id: 'Burger', name: 'Burgers', emoji: '🍔' },
  { id: 'Pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'Drinks', name: 'Drinks', emoji: '🥤' },
];

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [foodsMap, setFoodsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Smart Search States
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearchResultIds, setAiSearchResultIds] = useState(null); // null means no search filter

  // AI Dashboard Insights States
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axios.get(`${API_BASE}/food`);
        setFoods(res.data);
        const map = {};
        res.data.forEach(item => {
          map[item.id] = item;
        });
        setFoodsMap(map);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch food items');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // Fetch AI insights once foods are loaded and user is authenticated
  useEffect(() => {
    if (foods.length === 0) return;

    const fetchInsights = async () => {
      setInsightsLoading(true);
      try {
        const uid = auth.currentUser?.uid || 'anonymous';
        const res = await axios.post(`${API_BASE}/ai/dashboard-insights`, { userId: uid });
        setInsights(res.data);
      } catch (err) {
        console.error("Failed to load dashboard insights:", err);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, [foods]);

  // Handle AI Search Execution
  const triggerAiSearch = async () => {
    if (!searchQuery.trim()) {
      setAiSearchResultIds(null);
      return;
    }
    setAiSearching(true);
    try {
      const res = await axios.post(`${API_BASE}/ai/search`, { query: searchQuery });
      setAiSearchResultIds(res.data || []);
      if (res.data?.length === 0) {
        toast.error("FoodGPT couldn't find matching menu items for your search.");
      }
    } catch (err) {
      console.error(err);
      toast.error("AI Search failed. Using normal search.");
      setAiSearchResultIds(null);
    } finally {
      setAiSearching(false);
    }
  };

  // Run AI search when user stops typing (debounce) or toggles mode
  useEffect(() => {
    if (aiSearchMode && searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        triggerAiSearch();
      }, 800);
      return () => clearTimeout(delayDebounceFn);
    } else if (!searchQuery.trim() || !aiSearchMode) {
      setAiSearchResultIds(null);
    }
  }, [searchQuery, aiSearchMode]);

  // Add Combo items to cart
  const handleAddComboToCart = (combo) => {
    let addedCount = 0;
    combo.itemIds.forEach(id => {
      const food = foodsMap[id];
      if (food) {
        addToCart(food);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      toast.success(`Added ${combo.name} items to Cart! 🛒`);
    }
  };

  // Filter food catalog
  const filteredFoods = foods.filter(f => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    
    if (aiSearchMode && aiSearchResultIds !== null) {
      // If AI search mode is active, check if item matches the AI result IDs
      return matchesCategory && aiSearchResultIds.includes(f.id);
    } else {
      // Normal search
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            f.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }
  });

  if (loading) {
    return (
      <div className="px-4 sm:px-6 md:px-12 py-6 max-w-7xl mx-auto page-enter">
        <div className="mb-10 h-56 md:h-64 rounded-2xl bg-surface shimmer"></div>
        <div className="flex gap-3 mb-8 overflow-x-hidden">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-11 w-28 bg-surface rounded-xl shimmer"></div>
          ))}
        </div>
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
    <div className="px-4 sm:px-6 md:px-12 py-6 max-w-7xl mx-auto page-enter space-y-10">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card/90 to-card"></div>
        <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[160%] bg-primary/10 blur-[100px] rounded-full pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <div className="max-w-2xl space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-primary/15 text-primary text-xs font-black border border-primary/25">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                AI-Powered Dining
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-white"
            >
              Welcome to <span className="gradient-text">FoodGPT</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-sm sm:text-base max-w-lg leading-relaxed font-medium"
            >
              Your intelligent food delivery companion. Explore smart search, customized meal planners, and personalized combo offers.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Unified Search Section */}
      <div className="bg-surface/80 backdrop-blur-md border border-white/5 p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Search input with toggle */}
        <div className="relative w-full md:max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input
            id="main-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={aiSearchMode ? "Try: 'Something cheesy and filling under 1000'" : "Search dishes, categories..."}
            className="w-full pl-11 pr-24 py-3.5 bg-dark border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white placeholder-gray-600 transition-colors"
          />
          {aiSearching && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
          )}
          {aiSearchMode && searchQuery.trim().length > 0 && !aiSearching && (
            <button
              onClick={triggerAiSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ask AI
            </button>
          )}
        </div>

        {/* AI search mode toggle */}
        <div className="flex items-center gap-3 shrink-0 bg-dark/60 border border-gray-800 p-2 rounded-xl">
          <Sparkles className={`w-4 h-4 ${aiSearchMode ? 'text-primary' : 'text-gray-500'}`} />
          <span className="text-xs font-semibold text-gray-300">FoodGPT Smart Search</span>
          <button
            onClick={() => {
              setAiSearchMode(!aiSearchMode);
              setSearchQuery('');
              setAiSearchResultIds(null);
            }}
            className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${
              aiSearchMode ? 'bg-primary' : 'bg-gray-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                aiSearchMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* FoodGPT Dashboard Insights (Personalized, Combo & Special Deals) */}
      <AnimatePresence>
        {insights && !insightsLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Daily Special Deal (4 columns) */}
            <div className="lg:col-span-4 bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20 p-5 rounded-2xl flex flex-col justify-between shadow-md">
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-full bg-primary/25 text-primary text-[10px] font-black border border-primary/20">
                  🎁 TODAY'S SPECIAL
                </span>
                {(() => {
                  const food = foodsMap[insights.dailySpecial?.id];
                  if (!food) return null;
                  return (
                    <div className="space-y-3 pt-2">
                      <img 
                        src={food.image_url} 
                        alt={food.name} 
                        className="w-full h-32 object-cover rounded-xl border border-primary/10 shadow-inner"
                      />
                      <div>
                        <h4 className="font-extrabold text-base text-white">{food.name}</h4>
                        <p className="text-primary font-black text-sm mt-0.5">{insights.dailySpecial?.specialOffer}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {(() => {
                const food = foodsMap[insights.dailySpecial?.id];
                if (!food) return null;
                return (
                  <button
                    onClick={() => {
                      addToCart(food);
                      toast.success(`Added Special ${food.name} to Cart!`);
                    }}
                    className="mt-4 w-full py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Claim Offer
                  </button>
                );
              })()}
            </div>

            {/* AI Combo Offers (8 columns) */}
            <div className="lg:col-span-8 bg-surface/80 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-lg space-y-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" />
                AI-Generated Combo Feast Deals
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.comboOffers?.map((combo, idx) => (
                  <div 
                    key={idx}
                    className="bg-dark/40 border border-gray-800/40 p-4 rounded-xl flex flex-col justify-between hover:border-primary/20 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-black text-sm text-white truncate">{combo.name}</h4>
                        <span className="text-primary font-black text-sm shrink-0">₹{combo.discountedPrice}</span>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{combo.description}</p>
                      
                      {/* Combo Items icons */}
                      <div className="flex gap-2 pt-1">
                        {combo.itemIds.map(id => {
                          const food = foodsMap[id];
                          if (!food) return null;
                          return (
                            <div key={id} className="w-8 h-8 rounded-lg overflow-hidden border border-gray-800" title={food.name}>
                              <img src={food.image_url} alt={food.name} className="w-full h-full object-cover" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddComboToCart(combo)}
                      className="mt-3.5 w-full py-2 bg-primary/10 hover:bg-primary border border-primary/20 hover:border-transparent text-primary hover:text-white transition-all font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add Combo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Catalog Section */}
      <div className="space-y-6">
        
        {/* Category filters */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2.5 no-scrollbar">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-sm ${
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

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold">
              {activeCategory === 'All' ? 'Explore Menu' : activeCategory}
            </h2>
            <span className="text-xs text-gray-500 bg-surface px-2.5 py-0.5 rounded-full border border-gray-800 font-semibold">
              {filteredFoods.length} Items
            </span>
          </div>
        </div>

        {/* Food Cards Grid */}
        <AnimatePresence mode="wait">
          {filteredFoods.length > 0 ? (
            <motion.div 
              key={activeCategory + searchQuery + (aiSearchResultIds ? aiSearchResultIds.join(',') : '')}
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
              className="text-center py-20 bg-surface rounded-2xl border border-gray-800/40"
            >
              <div className="inline-block p-5 rounded-full bg-dark mb-4 text-gray-600">
                <Pizza className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">No culinary items found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters or AI search keywords.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Personalized Insights Row (Only if insights exist) */}
      {insights?.personalized?.length > 0 && (
        <div className="bg-surface/80 backdrop-blur-md border border-white/5 p-5 sm:p-6 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            Recommended For You (AI-Personalized)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.personalized.map((rec, idx) => {
              const food = foodsMap[rec.id];
              if (!food) return null;
              return (
                <div 
                  key={idx} 
                  className="bg-dark/40 border border-gray-800/40 p-4 rounded-xl flex items-center justify-between hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={food.image_url} 
                      alt={food.name} 
                      className="w-14 h-14 object-cover rounded-xl border border-gray-800"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-primary transition-colors">{food.name}</h4>
                      <p className="text-xs text-gray-400 mt-1 italic flex items-start gap-1">
                        <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(food);
                      toast.success(`Added ${food.name} to Cart!`);
                    }}
                    className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary border border-primary/20 text-primary hover:text-white transition-all shrink-0 ml-3"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Items Row (Only if insights exist) */}
      {insights?.trending?.length > 0 && (
        <div className="bg-surface/80 backdrop-blur-md border border-white/5 p-5 sm:p-6 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            Trending Right Now
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.trending.map((trend, idx) => {
              const food = foodsMap[trend.id];
              if (!food) return null;
              return (
                <div 
                  key={idx} 
                  className="bg-dark/40 border border-gray-800/40 p-4 rounded-xl flex items-center justify-between hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={food.image_url} 
                      alt={food.name} 
                      className="w-14 h-14 object-cover rounded-xl border border-gray-800"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-primary transition-colors">{food.name}</h4>
                      <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        🔥 {trend.trendFactor}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(food);
                      toast.success(`Added ${food.name} to Cart!`);
                    }}
                    className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary border border-primary/20 text-primary hover:text-white transition-all shrink-0 ml-3"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;

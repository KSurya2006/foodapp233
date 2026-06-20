import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Utensils, Calendar, IndianRupee, Users, ChefHat, ShoppingCart, Info, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '../store/CartContext';
import toast from 'react-hot-toast';
import { API_BASE } from '../config';

const AiAssistant = () => {
  const [activeTab, setActiveTab] = useState('recommend'); // 'recommend' or 'plan'
  const [foods, setFoods] = useState([]);
  const [foodsMap, setFoodsMap] = useState({});
  const { addToCart } = useCart();

  // Recommender States
  const [recommenderQuery, setRecommenderQuery] = useState('');
  const [recommenderLoading, setRecommenderLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Meal Planner States
  const [budget, setBudget] = useState('500');
  const [preference, setPreference] = useState('Veg');
  const [people, setPeople] = useState('2');
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);

  // Fetch foods to map IDs to food details
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
      } catch (err) {
        console.error("Failed to load food menu for AI page:", err);
      }
    };
    fetchFoods();
  }, []);

  const handleRecommendSubmit = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const finalQuery = customQuery || recommenderQuery;
    if (!finalQuery.trim() || recommenderLoading) return;

    if (!customQuery) {
      setRecommenderQuery(finalQuery);
    }
    setRecommenderLoading(true);
    setRecommendations([]);

    try {
      const res = await axios.post(`${API_BASE}/ai/recommend`, { query: finalQuery });
      // The API returns a list of items: [{ id, matchReason, confidence }]
      setRecommendations(res.data || []);
      if (res.data?.length === 0) {
        toast.success("AI couldn't find exact matches, showing general ideas!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch recommendations from FoodGPT.");
    } finally {
      setRecommenderLoading(false);
    }
  };

  const handleMealPlannerSubmit = async (e) => {
    e.preventDefault();
    if (!budget || !preference || !people || plannerLoading) return;

    setPlannerLoading(true);
    setMealPlan(null);

    try {
      const res = await axios.post(`${API_BASE}/ai/meal-plan`, {
        budget: Number(budget),
        preference,
        people: Number(people)
      });
      setMealPlan(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate meal plan from FoodGPT.");
    } finally {
      setPlannerLoading(false);
    }
  };

  const addAllPlanToCart = () => {
    if (!mealPlan || !mealPlan.meals) return;
    let addedCount = 0;
    mealPlan.meals.forEach(meal => {
      meal.items.forEach(item => {
        const foodItem = foodsMap[item.id];
        if (foodItem) {
          // Add item multiple times depending on quantity
          for (let q = 0; q < (item.quantity || 1); q++) {
            addToCart(foodItem);
          }
          addedCount += item.quantity || 1;
        }
      });
    });
    if (addedCount > 0) {
      toast.success(`Successfully added ${addedCount} items to your cart! 🛍️`);
    } else {
      toast.error("No items found to add.");
    }
  };

  const quickPrompts = [
    "I want spicy food under ₹200",
    "Suggest a healthy dinner",
    "Recommend vegetarian food",
    "I need high-protein meals",
    "Give me a combo meal for 3 people"
  ];

  return (
    <div className="px-4 sm:px-6 md:px-12 py-8 max-w-6xl mx-auto page-enter min-h-screen text-white">
      
      {/* Page Header */}
      <div className="text-center mb-10 relative">
        <div className="absolute top-[-50%] left-[40%] w-[20%] h-[150%] bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4"
        >
          <Sparkles className="w-4 h-4 animate-pulse text-yellow-400" />
          FOODGPT INTELLIGENT SUITE
        </motion.div>
        
        <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
          AI <span className="gradient-text">Assistant Center</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Unlock culinary suggestions tailored specifically to your cravings, budget, and guest count, generated in real-time.
        </p>
      </div>

      {/* Tab Controls */}
      <div className="flex justify-center mb-8">
        <div className="p-1.5 bg-surface border border-gray-800 rounded-2xl flex gap-1.5 max-w-md w-full">
          <button
            onClick={() => setActiveTab('recommend')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'recommend'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Utensils className="w-4 h-4" />
            AI Recommender
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'plan'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            AI Meal Planner
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Inputs */}
        <div className="lg:col-span-4 space-y-6">
          {activeTab === 'recommend' ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface/80 backdrop-blur-md border border-white/5 p-6 rounded-2xl"
            >
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                Ask FoodGPT
              </h2>
              
              <form onSubmit={handleRecommendSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    What are you craving?
                  </label>
                  <textarea
                    value={recommenderQuery}
                    onChange={(e) => setRecommenderQuery(e.target.value)}
                    placeholder="e.g. I want spicy pepperoni pizza or cheesy burgers under 1500"
                    rows="4"
                    className="w-full px-4 py-3 bg-dark border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white placeholder-gray-600 resize-none leading-relaxed"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={recommenderLoading || !recommenderQuery.trim()}
                  className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-primary/95 disabled:opacity-50 transition-colors font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                >
                  {recommenderLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Consulting Menu...
                    </>
                  ) : (
                    <>
                      Ask AI Assistant
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Prompts */}
              <div className="mt-6 border-t border-gray-800 pt-6">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Ideas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={(e) => handleRecommendSubmit(e, prompt)}
                      className="px-3 py-1.5 rounded-lg bg-dark border border-gray-800 text-[11px] font-medium text-gray-400 hover:text-white hover:border-gray-700 transition-all text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface/80 backdrop-blur-md border border-white/5 p-6 rounded-2xl"
            >
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Meal Setup
              </h2>
              
              <form onSubmit={handleMealPlannerSubmit} className="space-y-4">
                {/* Budget */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Budget Limit</span>
                    <span className="text-primary font-bold">₹{budget}</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="Budget in INR"
                      className="w-full pl-10 pr-4 py-3 bg-dark border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white"
                    />
                  </div>
                </div>

                {/* Preference */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Dietary Preference
                  </label>
                  <select
                    value={preference}
                    onChange={(e) => setPreference(e.target.value)}
                    className="w-full px-4 py-3 bg-dark border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white"
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Healthy">Healthy Options Only</option>
                    <option value="Spicy">Spicy Cravings</option>
                    <option value="Drinks & Desserts">Drinks & Desserts</option>
                  </select>
                </div>

                {/* People Count */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Number of Guests</span>
                    <span className="text-primary font-bold">{people} Person(s)</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={people}
                      onChange={(e) => setPeople(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={plannerLoading || !budget || !people}
                  className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-primary/95 disabled:opacity-50 transition-colors font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                >
                  {plannerLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Drafting Plan...
                    </>
                  ) : (
                    <>
                      Generate AI Plan
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>

        {/* Right Side Outputs */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            
            {/* Recommender Output */}
            {activeTab === 'recommend' && (
              <motion.div
                key="recommend-output"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {recommenderLoading && (
                  <div className="py-24 text-center bg-surface border border-white/5 rounded-2xl flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <h3 className="font-bold text-lg mb-2">Analyzing Menu & Cravings...</h3>
                    <p className="text-gray-500 text-sm max-w-xs">FoodGPT is processing our list of active dishes to locate the absolute best match.</p>
                  </div>
                )}

                {!recommenderLoading && recommendations.length === 0 && (
                  <div className="py-24 text-center bg-surface border border-white/5 rounded-2xl flex flex-col items-center justify-center px-4">
                    <div className="w-16 h-16 rounded-full bg-dark flex items-center justify-center mb-4 text-gray-500">
                      <ChefHat className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">No Recommendations Yet</h3>
                    <p className="text-gray-500 text-sm max-w-sm">Use the box on the left or click a quick idea tag to get personalized suggestions from FoodGPT AI!</p>
                  </div>
                )}

                {!recommenderLoading && recommendations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Recommended Menu Matches ({recommendations.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.map((rec, index) => {
                        const food = foodsMap[rec.id];
                        if (!food) return null;
                        
                        return (
                          <motion.div
                            key={food.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col justify-between hover:border-primary/20 transition-all group"
                          >
                            <div className="flex gap-4">
                              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-800/80">
                                <img 
                                  src={food.image_url} 
                                  alt={food.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="font-extrabold text-sm sm:text-base text-white group-hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-none">
                                    {food.name}
                                  </h4>
                                  <span className="text-primary font-black text-sm">₹{food.price}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                                    {food.category}
                                  </span>
                                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                                    {Math.round(rec.confidence * 100)}% Match
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3.5 bg-dark/50 border border-gray-800/50 p-2.5 rounded-xl text-xs text-gray-400 leading-relaxed italic flex items-start gap-1.5">
                              <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{rec.matchReason}</span>
                            </div>

                            <button
                              onClick={() => {
                                addToCart(food);
                                toast.success(`${food.name} added to cart!`);
                              }}
                              className="mt-3.5 w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary border border-primary/20 hover:border-transparent text-primary hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add to Order
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Meal Planner Output */}
            {activeTab === 'plan' && (
              <motion.div
                key="plan-output"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {plannerLoading && (
                  <div className="py-24 text-center bg-surface border border-white/5 rounded-2xl flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <h3 className="font-bold text-lg mb-2">Creating Meal Plan...</h3>
                    <p className="text-gray-500 text-sm max-w-xs">FoodGPT is cross-referencing prices, serving sizes, and preferences to build your curated feast plan.</p>
                  </div>
                )}

                {!plannerLoading && !mealPlan && (
                  <div className="py-24 text-center bg-surface border border-white/5 rounded-2xl flex flex-col items-center justify-center px-4">
                    <div className="w-16 h-16 rounded-full bg-dark flex items-center justify-center mb-4 text-gray-500">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">No Meal Plan Formulated</h3>
                    <p className="text-gray-500 text-sm max-w-sm">Enter your preferred budget, diet preference, and people count, then generate a custom plan!</p>
                  </div>
                )}

                {!plannerLoading && mealPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Plan Summary Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-extrabold text-lg text-white">FoodGPT Curated Plan</h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {mealPlan.dietaryInfo} • {mealPlan.budgetStatus}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-[10px] text-gray-500 uppercase font-medium">Estimated Cost</span>
                          <span className="text-xl font-black text-primary">₹{mealPlan.totalCost}</span>
                        </div>
                        <button
                          onClick={addAllPlanToCart}
                          className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add Plan to Cart
                        </button>
                      </div>
                    </div>

                    {/* Meal Types Grid */}
                    <div className="space-y-4">
                      {mealPlan.meals?.map((meal, index) => (
                        <div key={index} className="bg-surface border border-white/5 p-5 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center border-b border-gray-800/80 pb-3">
                            <span className="text-sm font-black text-primary uppercase tracking-wider">
                              🍴 {meal.mealType}
                            </span>
                            <span className="text-xs text-gray-400 italic">
                              {meal.reason}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {meal.items.map((planItem, idx) => {
                              const food = foodsMap[planItem.id];
                              if (!food) return null;
                              
                              return (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-dark/40 border border-gray-800/40 rounded-xl">
                                  <img 
                                    src={food.image_url} 
                                    alt={food.name} 
                                    className="w-12 h-12 object-cover rounded-lg shrink-0 border border-gray-800"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-xs sm:text-sm text-white truncate">{food.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] text-gray-400">Qty: {planItem.quantity}</span>
                                      <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                      <span className="text-[10px] text-primary font-bold">₹{food.price * planItem.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;

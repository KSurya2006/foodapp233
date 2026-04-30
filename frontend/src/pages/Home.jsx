import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodCard from '../components/FoodCard';
import { Flame, Pizza, Coffee, Beef } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  { id: 'All', name: 'All', icon: <Flame className="w-5 h-5" /> },
  { id: 'Burger', name: 'Burger', icon: <Beef className="w-5 h-5" /> },
  { id: 'Pizza', name: 'Pizza', icon: <Pizza className="w-5 h-5" /> },
  { id: 'Drinks', name: 'Drinks', icon: <Coffee className="w-5 h-5" /> },
];

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axios.get('https://food-app-backend-y263.onrender.com/food');
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

  const filteredFoods = activeCategory === 'All' 
    ? foods 
    : foods.filter(f => f.category === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gray-800 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse">Loading deliciousness...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <div className="mb-12 relative rounded-3xl overflow-hidden glass p-8 md:p-12 border border-white/5 animate-fade-in">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary text-sm font-bold mb-4 border border-primary/30">
            🔥 Hot & Spicy
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Craving something <br />
            <span className="gradient-text">delicious?</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-lg">
            Get the best food from the best restaurants delivered right to your doorstep in minutes.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-10">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'bg-darker border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      {filteredFoods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map(food => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-3xl border border-gray-800">
          <div className="inline-block p-6 rounded-full bg-darker mb-4">
            <Pizza className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No items found</h3>
          <p className="text-gray-500">We couldn't find any food in this category.</p>
        </div>
      )}
    </div>
  );
};

export default Home;

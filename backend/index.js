require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Global API rate limiting
const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Specific rate limit for sensitive routes (auth, orders, AI generation)
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests
  message: { error: 'Too many requests to this endpoint, please try again later.' }
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
let aiEnabled = false;
let genAI;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  aiEnabled = true;
  console.log("Gemini AI successfully initialized.");
} else {
  console.warn("GEMINI_API_KEY is not defined. AI features will run in Mock AI mode.");
}

// Mock database fallbacks
const mockFoodItems = [
  { id: 1, name: 'Classic Burger', price: 12, category: 'Burger', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
  { id: 2, name: 'Pepperoni Pizza', price: 15, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
  { id: 3, name: 'Margherita Pizza', price: 14, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
  { id: 4, name: 'Cheeseburger', price: 13, category: 'Burger', image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
  { id: 5, name: 'Cola', price: 3, category: 'Drinks', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' },
  { id: 6, name: 'Lemonade', price: 4, category: 'Drinks', image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' }
];

// Helper Functions
async function getFoodItems() {
  if (!supabase) return mockFoodItems;
  try {
    const { data, error } = await supabase.from('food_items').select('*');
    if (error || !data || data.length === 0) return mockFoodItems;
    return data;
  } catch (err) {
    return mockFoodItems;
  }
}

async function getUserOrders(userId) {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

async function getMockAiResponse(userPrompt, systemPrompt, jsonMode) {
  const normalized = userPrompt.toLowerCase();
  const menu = await getFoodItems();
  
  if (systemPrompt.includes("Recommender")) {
    let maxPrice = Infinity;
    const underMatch = normalized.match(/(?:under|below|less than|max|budget of)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
    if (underMatch && underMatch[1]) {
      maxPrice = parseFloat(underMatch[1]);
    }

    let candidates = menu;
    if (normalized.includes("spicy") || normalized.includes("pepperoni")) {
      candidates = candidates.filter(item => item.name.toLowerCase().includes("spicy") || item.name.toLowerCase().includes("pepperoni"));
    } else if (normalized.includes("burger") || normalized.includes("cheesy") || normalized.includes("cheese")) {
      candidates = candidates.filter(item => item.name.toLowerCase().includes("burger") || item.name.toLowerCase().includes("cheese"));
    } else if (normalized.includes("sweet") || normalized.includes("drink") || normalized.includes("lemon") || normalized.includes("cold") || normalized.includes("coffee") || normalized.includes("cola")) {
      candidates = candidates.filter(item => item.category === "Drinks" || item.name.toLowerCase().includes("coffee") || item.name.toLowerCase().includes("cola"));
    } else if (normalized.includes("veg") || normalized.includes("vegetarian") || normalized.includes("margherita")) {
      candidates = candidates.filter(item => item.name.toLowerCase().includes("veg") || item.name.toLowerCase().includes("margherita") || item.category === "Pizza");
    }

    candidates = candidates.filter(item => item.price <= maxPrice);

    if (candidates.length === 0) {
      candidates = menu.filter(item => item.price <= maxPrice);
    }

    if (candidates.length === 0) {
      candidates = [...menu].sort((a, b) => a.price - b.price).slice(0, 2);
    }

    return candidates.slice(0, 3).map(item => ({
      id: item.id,
      matchReason: `Fit check: Delicious ${item.name} perfectly matches your craving under your budget constraint.`,
      confidence: 0.95
    }));
  }
  
  if (systemPrompt.includes("Meal Planner")) {
    const isVeg = normalized.includes("veg");
    let budget = 200;
    let people = 1;
    
    const budgetMatch = normalized.match(/budget:\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) || normalized.match(/(?:rs\.?|inr|₹)\s*(\d+)/i);
    if (budgetMatch && budgetMatch[1]) budget = parseFloat(budgetMatch[1]);
    
    const peopleMatch = normalized.match(/plan for\s*(\d+)/i) || normalized.match(/(\d+)\s*people/i);
    if (peopleMatch && peopleMatch[1]) people = parseInt(peopleMatch[1]);

    const budgetPerPerson = budget / people;
    
    let candidates = menu;
    if (isVeg) {
      candidates = candidates.filter(item => item.name.toLowerCase().includes("veg") || item.name.toLowerCase().includes("margherita") || item.category === "Drinks");
    }
    
    candidates.sort((a, b) => a.price - b.price);
    
    const selectedItems = [];
    let currentCost = 0;
    
    for (const item of candidates) {
      if (currentCost + item.price <= budgetPerPerson) {
        selectedItems.push({ id: item.id, quantity: people });
        currentCost += item.price;
      }
    }
    
    if (selectedItems.length === 0 && menu.length > 0) {
      selectedItems.push({ id: menu[0].id, quantity: people });
      currentCost += menu[0].price;
    }

    return {
      totalCost: currentCost * people,
      peopleCount: people,
      meals: [
        {
          mealType: "Lunch",
          items: selectedItems,
          reason: `Tailored selection fit for your preference and budget.`
        }
      ],
      dietaryInfo: isVeg ? "100% Vegetarian Meal Plan" : "Balanced Diet Plan",
      budgetStatus: "Perfectly within budget limits"
    };
  }
  
  if (systemPrompt.includes("Search")) {
    let maxPrice = Infinity;
    const underMatch = normalized.match(/(?:under|below|less than|max|budget of)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
    if (underMatch && underMatch[1]) {
      maxPrice = parseFloat(underMatch[1]);
    }

    let candidates = menu;
    if (normalized.includes("burger")) {
      candidates = candidates.filter(item => item.name.toLowerCase().includes("burger"));
    } else if (normalized.includes("pizza")) {
      candidates = candidates.filter(item => item.name.toLowerCase().includes("pizza") || item.name.toLowerCase().includes("margherita"));
    } else if (normalized.includes("drink") || normalized.includes("cola") || normalized.includes("coffee")) {
      candidates = candidates.filter(item => item.category === "Drinks" || item.name.toLowerCase().includes("cola") || item.name.toLowerCase().includes("coffee"));
    }
    
    candidates = candidates.filter(item => item.price <= maxPrice);
    if (candidates.length === 0) {
      candidates = menu.filter(item => item.price <= maxPrice);
    }
    
    return candidates.map(item => item.id);
  }
  
  if (systemPrompt.includes("Insights")) {
    const popular = menu.slice(0, 2);
    const specials = menu.slice(2, 4);
    return {
      personalized: popular.map(item => ({ id: item.id, reason: `Based on popular choices, we think you'll love this!` })),
      trending: specials.map(item => ({ id: item.id, trendFactor: "Trending #1 in your area today!" })),
      dailySpecial: menu[0] ? { id: menu[0].id, specialOffer: "10% off today!" } : null,
      comboOffers: menu.length >= 2 ? [
        {
          name: "Star Combo Deal",
          itemIds: [menu[0].id, menu[menu.length - 1].id],
          discountedPrice: Math.round((menu[0].price + menu[menu.length - 1].price) * 0.8),
          description: "Get a delicious meal combo at a discount!"
        }
      ] : []
    };
  }
  
  // Handle Chat assistant fallbacks dynamically
  let maxPrice = Infinity;
  const underMatch = normalized.match(/(?:under|below|less than|max|budget of)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
  if (underMatch && underMatch[1]) {
    maxPrice = parseFloat(underMatch[1]);
  }

  let candidates = menu;
  if (normalized.includes("spicy") || normalized.includes("pepperoni")) {
    candidates = candidates.filter(item => item.name.toLowerCase().includes("spicy") || item.name.toLowerCase().includes("pepperoni"));
  } else if (normalized.includes("burger") || normalized.includes("cheesy") || normalized.includes("cheese")) {
    candidates = candidates.filter(item => item.name.toLowerCase().includes("burger") || item.name.toLowerCase().includes("cheese"));
  } else if (normalized.includes("pizza") || normalized.includes("margherita")) {
    candidates = candidates.filter(item => item.name.toLowerCase().includes("pizza") || item.name.toLowerCase().includes("margherita"));
  } else if (normalized.includes("drink") || normalized.includes("cola") || normalized.includes("coffee") || normalized.includes("lemonade")) {
    candidates = candidates.filter(item => item.category === "Drinks" || item.name.toLowerCase().includes("cola") || item.name.toLowerCase().includes("coffee"));
  }

  candidates = candidates.filter(item => item.price <= maxPrice);

  if (maxPrice !== Infinity || candidates.length < menu.length) {
    if (candidates.length > 0) {
      const itemsList = candidates.slice(0, 4).map(item => `• **${item.name}** - ₹${item.price} (${item.category})`).join('\n');
      let msg = `Here are some recommendations matching your request:\n\n${itemsList}\n\nWould you like me to add any of these to your cart? 🍕🍔`;
      if (maxPrice !== Infinity) {
        msg = `Here are some items under ₹${maxPrice} matching your request:\n\n${itemsList}\n\nWould you like to order any of these? 🥤`;
      }
      return msg;
    }
  }

  if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("hey")) {
    return "Hello! I'm FoodGPT, your AI culinary assistant. How can I help you today? I can suggest dishes, plan meals, or check details for you! 🍔🍕";
  }
  if (normalized.includes("price") || normalized.includes("how much") || normalized.includes("cost")) {
    return "Our dishes start from just ₹2.5 (Coca Cola Can) to ₹400 (Farmhouse Pizza). Let me know if you would like me to recommend a budget meal! 🥤";
  }
  if (normalized.includes("order") || normalized.includes("status")) {
    return "You can check your order status under the 'Order History' tab. Let me know if you need help selecting items for your next order!";
  }
  return "I'm FoodGPT, your artificial intelligence culinary guide. Feel free to ask about our menu items, plan a budget meal, or request specific recommendations like 'spicy food'!";
}

async function callGemini(systemPrompt, userPrompt, jsonMode = false) {
  if (!aiEnabled || !genAI) {
    return await getMockAiResponse(userPrompt, systemPrompt, jsonMode);
  }
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });
    
    const config = {};
    if (jsonMode) {
      config.responseMimeType = "application/json";
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: config
    });
    
    const response = await result.response;
    const text = response.text();
    return jsonMode ? JSON.parse(text) : text;
  } catch (error) {
    console.error("Gemini API Error, falling back to Mock:", error);
    return await getMockAiResponse(userPrompt, systemPrompt, jsonMode);
  }
}

// REST API Endpoints

app.get('/food', async (req, res) => {
  try {
    const data = await getFoodItems();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching food items.' });
  }
});

app.post('/order', sensitiveLimiter, async (req, res) => {
  const { items, total_price, user_phone, user_name, user_id } = req.body;
  try {
    const cleanPhone = DOMPurify.sanitize(user_phone);
    const cleanName = DOMPurify.sanitize(user_name);
    
    if (!supabase) {
      return res.status(201).json({ message: 'Order placed mock successfully' });
    }
    const { data, error } = await supabase.from('orders').insert([
      { items, total_price, status: 'pending', user_phone: cleanPhone, user_name: cleanName, user_id }
    ]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred while placing the order.' });
  }
});

app.get('/orders', async (req, res) => {
  const { user_id } = req.query;
  const isAdmin = req.headers['x-admin-token'] === 'true';

  try {
    if (!isAdmin && !user_id) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identification.' });
    }

    if (!supabase) {
      return res.json([
        { id: 101, status: 'pending', total_price: 27, items: [{name: 'Classic Burger', quantity: 1, price: 12}], user_id: user_id || 'admin', created_at: new Date().toISOString() }
      ]);
    }

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (!isAdmin) {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching orders.' });
  }
});

app.post('/admin/food', sensitiveLimiter, async (req, res) => {
  const { name, price, category, image_url } = req.body;
  try {
    const cleanName = DOMPurify.sanitize(name);
    const cleanCategory = DOMPurify.sanitize(category);
    
    if (!supabase) {
      return res.status(201).json({ message: 'Food item mock added' });
    }
    const { data, error } = await supabase.from('food_items').insert([
      { name: cleanName, price, category: cleanCategory, image_url }
    ]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred while adding the food item.' });
  }
});

app.put('/admin/orders/:id/status', sensitiveLimiter, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const cleanStatus = DOMPurify.sanitize(status);
    if (!supabase) {
      return res.json({ message: 'Order status mock updated' });
    }
    const { data, error } = await supabase
      .from('orders')
      .update({ status: cleanStatus })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred while updating order status.' });
  }
});

app.post('/users', sensitiveLimiter, async (req, res) => {
  const { id, phone_number, name } = req.body;
  try {
    const cleanPhone = DOMPurify.sanitize(phone_number);
    const cleanName = DOMPurify.sanitize(name);
    
    if (!supabase) {
      return res.status(201).json({ message: 'User mock added' });
    }
    const { data, error } = await supabase
      .from('users')
      .upsert([{ id, phone_number: cleanPhone, name: cleanName }], { onConflict: 'id' })
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred while adding the user.' });
  }
});


// ==========================================
// FOODGPT AI ENDPOINTS
// ==========================================

// 1. AI Food Recommender
app.post('/ai/recommend', sensitiveLimiter, async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing recommendation query.' });
  }
  try {
    const menu = await getFoodItems();
    const systemPrompt = `You are FoodGPT Recommender. Recommend items from the menu matching the query.
Here is the current menu database:
${JSON.stringify(menu)}

Only recommend items that exist in our menu database.
Return a JSON array of objects. Do not wrap it in markdown code blocks.
Each object must contain:
- 'id': (number) the food item's unique id
- 'matchReason': (string) brief, engaging explanation of why this item matches the query
- 'confidence': (number) confidence score between 0.0 and 1.0`;

    const aiRes = await callGemini(systemPrompt, query, true);
    res.json(aiRes);
  } catch (err) {
    console.error("AI Recommender route error:", err);
    res.status(500).json({ error: 'AI Recommendation failed.' });
  }
});

// 2. AI Meal Planner
app.post('/ai/meal-plan', sensitiveLimiter, async (req, res) => {
  const { budget, preference, people } = req.body;
  if (!budget || !preference || !people) {
    return res.status(400).json({ error: 'Missing meal planner parameters.' });
  }
  try {
    const menu = await getFoodItems();
    const systemPrompt = `You are FoodGPT Meal Planner. Create a structured meal plan using menu items.
Here is the menu:
${JSON.stringify(menu)}

Inputs:
- Budget: ₹${budget} (INR)
- Dietary Preference: ${preference} (e.g. veg, non-veg, healthy, low-carb)
- Number of People: ${people}

Construct a daily plan consisting of meal types (e.g. Lunch, Dinner, Snack/Dessert).
Return a JSON object only. Do not wrap in markdown code blocks.
The JSON must follow this schema:
{
  "totalCost": number (total sum of selected items * quantities),
  "peopleCount": number,
  "meals": [
    {
      "mealType": "Lunch" | "Dinner" | "Snack" | "Breakfast",
      "items": [
        { "id": number, "quantity": number }
      ],
      "reason": "short explanation of why this selection fits the plan"
    }
  ],
  "dietaryInfo": "Veg / Non-Veg validation and calorie summary",
  "budgetStatus": "Description of budget utilization"
}`;

    const queryText = `Plan for ${people} people, preference: ${preference}, budget: ₹${budget}`;
    const aiRes = await callGemini(systemPrompt, queryText, true);
    res.json(aiRes);
  } catch (err) {
    console.error("AI Meal Planner route error:", err);
    res.status(500).json({ error: 'AI Meal Planning failed.' });
  }
});

// 3. Smart Search
app.post('/ai/search', sensitiveLimiter, async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing search query.' });
  }
  try {
    const menu = await getFoodItems();
    const systemPrompt = `You are FoodGPT Search. Parse the user's natural language search intent and match it against our menu.
Menu:
${JSON.stringify(menu)}

Return a JSON array of food item IDs that match the search query (e.g. [1, 4]). Only return the array of IDs. JSON format only.`;

    const aiRes = await callGemini(systemPrompt, query, true);
    res.json(aiRes);
  } catch (err) {
    console.error("AI Search route error:", err);
    res.status(500).json({ error: 'AI Search query failed.' });
  }
});

// 4. AI Chat Assistant
app.post('/ai/chat', sensitiveLimiter, async (req, res) => {
  const { message, history, userId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Missing message content.' });
  }
  try {
    const menu = await getFoodItems();
    const userOrders = await getUserOrders(userId);
    
    const systemPrompt = `You are FoodGPT, a premium AI customer support and recommendations agent for FoodGPT.
Respond politely and supportively to inquiries about the menu, item prices, suggestions, and orders.
Current Menu:
${JSON.stringify(menu)}

User's Order History:
${JSON.stringify(userOrders)}

Rules:
- Be friendly, concise, and professional.
- Utilize food emojis where appropriate.
- Refer to food item details (price, category) directly from our menu.
- Keep response under 3 short paragraphs.
- Return raw markdown text (not JSON).`;

    const userQuery = `History: ${JSON.stringify(history || [])}\nUser Message: ${message}`;
    const aiRes = await callGemini(systemPrompt, userQuery, false);
    res.json({ response: aiRes });
  } catch (err) {
    console.error("AI Chat route error:", err);
    res.status(500).json({ error: 'AI Chat assistant failed.' });
  }
});

// 5. Dashboard Insights (Personalized recommendations, combos, trending, daily special)
app.post('/ai/dashboard-insights', sensitiveLimiter, async (req, res) => {
  const { userId } = req.body;
  try {
    const menu = await getFoodItems();
    const userOrders = await getUserOrders(userId);

    const systemPrompt = `You are FoodGPT Insights. Generate dashboard recommendation modules for the user.
Menu:
${JSON.stringify(menu)}

User Orders History:
${JSON.stringify(userOrders)}

Generate:
1. Personalized recommendations based on their ordered items (or popular items if they have no order history).
2. Trending dishes with reasons.
3. A daily special offer.
4. AI-generated Combo offers combining items from our menu with custom discounts.

Return a JSON object only. Do not wrap in markdown code blocks.
The JSON must follow this schema:
{
  "personalized": [
    { "id": number, "reason": "Engaging reason why user would like it" }
  ],
  "trending": [
    { "id": number, "trendFactor": "e.g. +40% orders this week" }
  ],
  "dailySpecial": {
    "id": number,
    "specialOffer": "e.g. 20% OFF - Code: TODAY20"
  },
  "comboOffers": [
    {
      "name": "Combo Name",
      "itemIds": [number, number],
      "discountedPrice": number,
      "description": "Short tempting description"
    }
  ]
}`;

    const aiRes = await callGemini(systemPrompt, `userId: ${userId || 'anonymous'}`, true);
    res.json(aiRes);
  } catch (err) {
    console.error("AI Dashboard Insights error:", err);
    res.status(500).json({ error: 'AI Insights failed.' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

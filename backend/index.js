require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Global API rate limiting
const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Specific rate limit for sensitive routes (auth, orders)
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests
  message: { error: 'Too many requests to this endpoint, please try again later.' }
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Routes
app.get('/food', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([
        { id: 1, name: 'Classic Burger', price: 12, category: 'Burger', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
        { id: 2, name: 'Pepperoni Pizza', price: 15, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
        { id: 3, name: 'Margherita Pizza', price: 14, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
        { id: 4, name: 'Cheeseburger', price: 13, category: 'Burger', image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
        { id: 5, name: 'Cola', price: 3, category: 'Drinks', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' },
        { id: 6, name: 'Lemonade', price: 4, category: 'Drinks', image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' }
      ]);
    }
    const { data, error } = await supabase.from('food_items').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching food items.' });
  }
});

app.post('/order', sensitiveLimiter, async (req, res) => {
  const { items, total_price, user_phone, user_name, user_id } = req.body;
  try {
    // Sanitize user input
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
  const isAdmin = req.headers['x-admin-token'] === 'true'; // Basic mock admin check

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
    
    // Prevent IDOR: Only fetch orders for the specific user unless it's an admin
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
  const { status } = req.body; // e.g., 'completed'
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
    // Upsert the user: if id exists, update name and phone_number; otherwise insert.
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

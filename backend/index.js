require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

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
    res.status(500).json({ error: err.message });
  }
});

app.post('/order', async (req, res) => {
  const { items, total_price, user_phone, user_name, user_id } = req.body;
  try {
    if (!supabase) {
      return res.status(201).json({ message: 'Order placed mock successfully' });
    }
    const { data, error } = await supabase.from('orders').insert([
      { items, total_price, status: 'pending', user_phone, user_name, user_id }
    ]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/orders', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([
        { id: 101, status: 'pending', total_price: 27, items: [{name: 'Classic Burger', quantity: 1, price: 12}, {name: 'Pepperoni Pizza', quantity: 1, price: 15}], created_at: new Date().toISOString() }
      ]);
    }
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/food', async (req, res) => {
  const { name, price, category, image_url } = req.body;
  try {
    if (!supabase) {
      return res.status(201).json({ message: 'Food item mock added' });
    }
    const { data, error } = await supabase.from('food_items').insert([
      { name, price, category, image_url }
    ]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/admin/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'completed'
  try {
    if (!supabase) {
      return res.json({ message: 'Order status mock updated' });
    }
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/users', async (req, res) => {
  const { id, phone_number, name } = req.body;
  try {
    if (!supabase) {
      return res.status(201).json({ message: 'User mock added' });
    }
    // Upsert the user: if id exists, update name and phone_number; otherwise insert.
    const { data, error } = await supabase
      .from('users')
      .upsert([{ id, phone_number, name }], { onConflict: 'id' })
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

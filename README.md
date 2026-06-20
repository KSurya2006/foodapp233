# 🔮 FoodGPT: AI-Powered Premium Food Delivery Platform

FoodGPT is a full-stack, AI-powered food delivery web application built using React, Express, Supabase, and Google Gemini AI. It extends a premium dark-themed customer interface and administrator dashboard with state-of-the-art AI-driven search, recommendations, meal planners, and a global chatbot support system.

---

## 🎨 Architectural Overview

FoodGPT introduces a dedicated AI Services Layer connecting the Express backend to Google's Gemini API, parsing real database menu catalog information to serve intelligent recommendations and plans.

```mermaid
graph TD
    A[React Frontend] -->|API Requests (Axios)| B[Express Backend]
    A -->|Auth / Session| C[Firebase Authentication]
    B -->|Database CRUD| D[Supabase PostgreSQL]
    B -->|AI Context & Queries| G[Google Gemini AI]
    
    subgraph Frontend Features
        E[CartContext - Local Storage]
        H[Global Floating Chatbot]
        I[AI Assistant Page]
        J[Smart Search Toggle]
    end
    
    subgraph Backend Services
        F[DOMPurify Sanitization]
        K[Gemini Service Layer]
        L[Rate Limiters & Helmet]
    end
    
    A -.-> E
    A -.-> H
    A -.-> I
    A -.-> J
    B -.-> F
    B -.-> K
    B -.-> L
```

---

## 🚀 Key AI Features

### 1. 🧠 AI Food Recommender
*   **Location**: Dedicated AI Assistant page (`/ai`).
*   **Functionality**: Users type queries in natural language (e.g. *"I want spicy food under ₹200"* or *"Suggest a healthy dinner"*).
*   **Gemini Logic**: Gemini reviews all items in the Supabase database menu, selects the best matching dishes, and returns a confidence percentage alongside a specific reason for each recommendation.

### 2. 📅 AI Meal Planner
*   **Location**: Dedicated AI Assistant page (`/ai`).
*   **Inputs**: User specifies a budget limit (INR), dietary preferences (Vegetarian, Non-Veg, Healthy, etc.), and guest count.
*   **Functionality**: Generates a complete daily plan (Breakfast, Lunch, Dinner, Snack) using real menu items, respecting the budget, and provides an **"Add Plan to Cart"** single-click button.

### 3. 🔍 Smart Food Search
*   **Location**: Main menu search bar with a toggle switch labeled **FoodGPT Smart Search**.
*   **Functionality**: Enables semantic search (e.g. *"Show me cheesy burgers"*, *"I want something sweet"*). Translates user queries into matching database food item IDs using Gemini.

### 4. 💬 AI Chat Assistant (Floating Chatbot)
*   **Location**: Global floating widget available on all pages.
*   **Functionality**: An interactive chat window where users can talk to FoodGPT about menu items, individual pricing, combo offers, and order support.

### 5. ⚡ Dashboard Insights (Bonus Features)
*   **Location**: Top of the Home page dashboard.
*   **Personalized Recommendations**: Dynamically lists dish ideas based on the active user's past ordering history.
*   **AI Combo Deals**: Packages multiple menu items together with custom discount structures.
*   **Trending & Specials**: Recommends items showing high popularity in recent purchase activity.

---

## 💻 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [React 19](https://react.dev/) | UI library with Context API for state management. |
| | [Vite](https://vite.dev/) | Bundler and lightning-fast developer environment. |
| | [Tailwind CSS](https://tailwindcss.com/) | Dark UI theme styling. |
| | [Framer Motion](https://www.framer.com/motion/) | Slick transitions, page load fades, and slide-in panels. |
| | [Lucide React](https://lucide.dev/) | Fine-crafted iconography. |
| **Backend** | [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) | RESTful API server. |
| | [Gemini SDK](https://github.com/google/generative-ai-js) | `@google/generative-ai` library for connecting to Gemini 1.5 Flash. |
| | [Supabase Client](https://supabase.com/) | Database client connector. |
| | [DOMPurify](https://github.com/cure53/DOMPurify) | Sanitizes inputs to defend against XSS. |
| **Database** | [Supabase](https://supabase.com/) | Managed PostgreSQL database cloud host. |

---

## 📁 Project Directory Structure

```text
foodapp233/
├── backend/                  # Node.js + Express API Backend
│   ├── .env                  # Environment configs (Supabase + Gemini)
│   ├── index.js              # Express entry & AI route logic
│   └── package.json          # Server dependencies
└── frontend/                 # Vite + React Frontend
    ├── src/
    │   ├── components/       # UI (Navbar, Cart, FloatingChatbot, BottomNav)
    │   ├── pages/            # Views (Home, Login, Profile, OrderHistory, AiAssistant)
    │   ├── store/            # CartContext state provider
    │   ├── App.jsx           # App routing with PWA integrations
    │   └── firebase.js       # Firebase Auth client setup
    ├── package.json          # Client dependencies
    └── tailwind.config.js    # Custom style extension
```

---

## 🗄️ Database Schema Setup (Supabase)

Initialize your Supabase database using these table definitions:

```sql
-- Users table
create table public.users (
  id text primary key, -- Firebase Auth UID
  name text not null,
  phone_number text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Food menu catalog table
create table public.food_items (
  id bigint generated by default as identity primary key,
  name text not null,
  price numeric not null,
  category text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table
create table public.orders (
  id bigint generated by default as identity primary key,
  items jsonb not null,
  total_price numeric not null,
  status text default 'pending'::text not null,
  user_phone text not null,
  user_name text not null,
  user_id text references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 🛠️ Local Setup Guide

### 1. Backend Service Configuration
1. Navigate to `/backend`.
2. Install packages: `npm install`.
3. Create `/backend/.env` and append your API credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_api_key
   GEMINI_API_KEY=your_google_gemini_api_key
   PORT=3000
   ```
   *Note: If `GEMINI_API_KEY` is omitted, the backend runs in a smart mock simulation mode for testing.*
4. Start the Express server:
   ```bash
   node index.js
   ```

### 2. Frontend Client Configuration
1. Navigate to `/frontend`.
2. Install client-side packages: `npm install`.
3. Launch development server:
   ```bash
   npm run dev
   ```
4. Access client preview at `http://localhost:5173`.

---

## 🔌 API Endpoints Reference

### Core Routes
*   `GET /food` - Fetch food menu catalog.
*   `POST /order` - Place order.
*   `GET /orders?user_id=ID` - View order history (enforces user authorization checks).
*   `POST /users` - Synchronize Firebase profiles.

### FoodGPT AI Routes
*   `POST /ai/recommend` - Query food recommendations based on text prompt (returns `{ id, matchReason, confidence }`).
*   `POST /ai/meal-plan` - Plan daily food items based on `{ budget, preference, people }`.
*   `POST /ai/search` - Translate natural language search queries into menu IDs.
*   `POST /ai/chat` - Chatbot response for support and questions (returns raw text).
*   `POST /ai/dashboard-insights` - Generate user-specific recommendations, combos, trending lists, and daily special offers.

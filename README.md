# Premium Food Delivery Application

A full-stack, premium food delivery application featuring a dynamic user interface, seamless authentication, and a robust admin management portal.

## Features

### 🔐 Authentication & Security
- **Dual-Mode Login**: Separate authentication flows for regular customers and administrators.
- **Firebase Authentication**: Secure user authentication using Firebase.
- **Admin PIN Protection**: Exclusive access to the administrative dashboard secured by a specific PIN.
- **User-ID Mapping**: Seamless synchronization between Firebase Auth users and Supabase database records.

### 🍔 Customer Features
- Browse a rich catalog of food items organized by categories.
- Add items to cart and place orders.
- View real-time order status.
- Responsive, modern user interface.

### 👨‍💼 Administrator Features
- Dedicated Admin Dashboard.
- **Order Management**: View incoming customer orders and update their statuses (e.g., pending, completed).
- **Menu Management**: Add new food items to the database with image URLs, categories, and prices.

## Technology Stack

### Frontend
The frontend is built with performance and modern aesthetics in mind:
- **[React 19](https://react.dev/)** - Core UI library.
- **[Vite](https://vitejs.dev/)** - Fast frontend build tool.
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling for a premium look and feel.
- **[Firebase](https://firebase.google.com/)** - Managing secure user authentication.
- **[React Router DOM](https://reactrouter.com/)** - Handling application routing and protected routes.
- **[Axios](https://axios-http.com/)** - For making API requests to the backend.
- **[Lucide React](https://lucide.dev/)** - Beautiful, consistent iconography.
- **[React Hot Toast](https://react-hot-toast.com/)** - Elegant, lightweight notifications and alerts.

### Backend
The backend provides robust APIs and connects to a secure cloud database:
- **[Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)** - API development and routing.
- **[Supabase](https://supabase.com/)** - PostgreSQL database used for storing `users`, `food_items`, and `orders`.
- **[CORS](https://www.npmjs.com/package/cors)** - Cross-Origin Resource Sharing middleware.
- **[Dotenv](https://www.npmjs.com/package/dotenv)** - Environment variable management.

## Project Structure

- `/frontend/` - Contains all React source code, components, pages, and styling.
- `/backend/` - Contains the Express server, database connections, and REST endpoints.
- `food_items.csv` - Data file potentially used for database seeding.

## Setup Instructions

1. **Clone the repository.**
2. **Setup the Backend:**
   - Navigate to `/backend`.
   - Run `npm install` to install backend dependencies.
   - Create a `.env` file and add your `SUPABASE_URL`, `SUPABASE_KEY`, and `PORT`.
   - Start the server using `node index.js`.
3. **Setup the Frontend:**
   - Navigate to `/frontend`.
   - Run `npm install` to install frontend dependencies.
   - Configure Firebase in `firebase.js` if necessary.
   - Start the development server using `npm run dev`.

## APIs

- `GET /food`: Retrieve all food items.
- `POST /order`: Submit a new order.
- `GET /orders`: Fetch all orders (Admin).
- `POST /admin/food`: Add a new food item (Admin).
- `PUT /admin/orders/:id/status`: Update the status of an order (Admin).
- `POST /users`: Create or update user profiles based on Firebase Auth ID.

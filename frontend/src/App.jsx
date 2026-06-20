import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Home from './pages/Home';
import Login from './pages/Login';
import OrderHistory from './pages/OrderHistory';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import AiAssistant from './pages/AiAssistant';

import BottomNav from './components/BottomNav';
import FloatingChatbot from './components/FloatingChatbot';

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('adminToken') === 'true';
  return isAdmin ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark text-white font-sans relative">
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} />
        
        <Routes>
          {/* Admin routes without standard Navbar */}
          <Route path="/admin" element={
            <AdminRoute>
              <Navbar user={user} isAdminView={true} />
              <Admin />
            </AdminRoute>
          } />
          
          {/* Standard user routes */}
          <Route path="/*" element={
            <>
              {user && <Navbar user={user} />}
              {user && <Cart />}
              <main className="pb-24">
                <Routes>
                  <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                  <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
                  <Route path="/orders" element={user ? <OrderHistory /> : <Navigate to="/login" />} />
                  <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                  <Route path="/ai" element={user ? <AiAssistant /> : <Navigate to="/login" />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                </Routes>
              </main>
              {user && <FloatingChatbot />}
              {user && <BottomNav />}
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

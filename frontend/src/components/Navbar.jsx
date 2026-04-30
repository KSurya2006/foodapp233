import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, LogOut, ShieldAlert } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useCart } from '../store/CartContext';
import toast from 'react-hot-toast';

const Navbar = ({ user, isAdminView = false }) => {
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (isAdminView) {
        localStorage.removeItem('adminToken');
        toast.success('Exited Admin Portal');
        navigate('/');
      } else {
        await signOut(auth);
        toast.success('Logged out successfully');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <nav className={`sticky top-0 z-40 glass w-full py-4 px-6 md:px-12 flex items-center justify-between shadow-lg ${isAdminView ? 'border-b border-red-500/20' : ''}`}>
      <Link to={isAdminView ? '/admin' : '/'} className="flex items-center gap-2">
        {isAdminView ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center shadow-lg shadow-red-500/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-xl font-bold text-white">F</span>
          </div>
        )}
        <span className="text-xl font-extrabold tracking-tight hidden sm:block">
          {isAdminView ? (
            <>Admin<span className="text-red-500">Portal</span></>
          ) : (
            <>Food<span className="text-primary">App</span></>
          )}
        </span>
      </Link>

      {!isAdminView && (
        <div className="flex-1 max-w-md mx-4 md:mx-12 hidden md:block relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for delicious food..."
            className="w-full pl-10 pr-4 py-2 bg-darker border border-gray-800 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
          />
        </div>
      )}

      <div className="flex items-center gap-4 md:gap-6 ml-auto">
        {!isAdminView && (
          <>
            <Link to="/orders" className="text-gray-300 hover:text-white transition-colors text-sm font-medium hidden sm:block">
              Orders
            </Link>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-300 hover:text-white transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1 shadow-lg">
                  {totalItems}
                </span>
              )}
            </button>
          </>
        )}

        <div className="flex items-center gap-3 border-l border-gray-700 pl-4 md:pl-6 ml-2">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-gray-400">{isAdminView ? 'Secure Session' : 'Welcome back,'}</span>
            <span className="text-sm font-semibold truncate max-w-[100px]">{isAdminView ? 'Administrator' : (user?.phoneNumber || 'User')}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-darker rounded-full hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300"
            title={isAdminView ? "Exit Admin Portal" : "Logout"}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, Sparkles, ShoppingBag, Plus } from 'lucide-react';
import { auth } from '../firebase';
import { useCart } from '../store/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_BASE } from '../config';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm FoodGPT, your AI culinary assistant. Ask me anything about our menu, prices, or ordering! 🍕🍔", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Build simple chat history context
      const history = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await axios.post(`${API_BASE}/ai/chat`, {
        message: userMessage.text,
        history,
        userId: auth.currentUser?.uid
      });

      const aiText = res.data.response;
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Sorry, I had trouble processing that request. Please try again! 🥺", 
        sender: 'ai' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse double asterisks for bold markdown
  const formatText = (text) => {
    if (!text) return "";
    
    // Convert newlines to breaks
    const paragraphs = text.split('\n');
    return paragraphs.map((para, i) => {
      // Basic bold matching **bold**
      const parts = para.split(/\*\*([^*]+)\*\*/g);
      return (
        <p key={i} className={i > 0 ? "mt-2" : ""}>
          {parts.map((part, index) => {
            if (index % 2 === 1) {
              return <strong key={index} className="text-primary font-bold">{part}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="w-[320px] sm:w-[360px] h-[450px] sm:h-[500px] mb-4 bg-darker/90 border border-white/10 rounded-2xl shadow-2xl flex flex-col backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-orange-500 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1">
                    FoodGPT Assistant
                    <Sparkles className="w-3 h-3 animate-pulse text-yellow-300" />
                  </h3>
                  <span className="text-[10px] text-white/80 font-medium">AI Powered Support</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-dark/30">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                        : 'bg-surface border border-gray-800 text-gray-200 rounded-tl-none'
                    }`}>
                      {formatText(msg.text)}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary animate-pulse" />
                    </div>
                    <div className="p-3 bg-surface border border-gray-800 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-800/80 bg-surface flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask food recipe, prices, combo offers..."
                className="flex-1 px-3.5 py-2.5 bg-dark border border-gray-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary/50 text-white placeholder-gray-600"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/95 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-primary to-orange-500 text-white flex items-center justify-center shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all border border-white/10 relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default FloatingChatbot;

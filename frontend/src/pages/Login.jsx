import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Utensils, ShieldCheck, Lock, ShieldAlert, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [loginMode, setLoginMode] = useState('user'); // 'user' or 'admin'
  
  // User State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  // Admin State
  const [pin, setPin] = useState('');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          if (loginMode === 'user') toast.error('reCAPTCHA expired. Please try again.');
        }
      });
    }
  }, [loginMode]);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter your name');
    if (!phoneNumber.trim()) return toast.error('Please enter phone number');
    
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    setLoading(true);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setIsOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to send OTP. Try again.');
      if (window.recaptchaVerifier) {
         window.recaptchaVerifier.render().then(widgetId => {
            grecaptcha.reset(widgetId);
         });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error('Please enter OTP');
    
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      
      try {
        await axios.post('https://foodapp233.onrender.com/users', {
          id: result.user.uid,
          phone_number: result.user.phoneNumber,
          name: name
        });
      } catch (err) {
        console.error('Failed to save user to DB:', err);
      }

      toast.success(`Welcome, ${name}! 🎉`);
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pin === '1234') {
        localStorage.setItem('adminToken', 'true');
        toast.success('Admin access granted');
        navigate('/admin');
      } else {
        toast.error('Invalid Admin PIN');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className={`absolute top-[-15%] left-[-15%] w-[45%] h-[45%] blur-[120px] rounded-full pointer-events-none transition-all duration-700 ${
        loginMode === 'admin' ? 'bg-red-500/15' : 'bg-primary/12'
      }`}></div>
      <div className={`absolute bottom-[-15%] right-[-15%] w-[45%] h-[45%] blur-[120px] rounded-full pointer-events-none transition-all duration-700 ${
        loginMode === 'admin' ? 'bg-gray-600/15' : 'bg-orange-500/10'
      }`}></div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-[20%] right-[20%] text-4xl opacity-10 float select-none pointer-events-none">🍕</div>
      <div className="absolute bottom-[30%] left-[15%] text-3xl opacity-10 float select-none pointer-events-none" style={{ animationDelay: '1s' }}>🍔</div>
      <div className="absolute top-[60%] right-[10%] text-3xl opacity-10 float select-none pointer-events-none" style={{ animationDelay: '2s' }}>🥤</div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/30 border border-gray-800/60 relative z-10">
          
          {/* Mode Toggle */}
          <div className="flex bg-darker p-1 rounded-xl border border-gray-800/60 mb-7">
            <button 
              onClick={() => setLoginMode('user')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                loginMode === 'user' 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Customer
            </button>
            <button 
              onClick={() => setLoginMode('admin')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                loginMode === 'admin' 
                  ? 'bg-gray-700 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <AnimatePresence mode="wait">
              {loginMode === 'user' ? (
                <motion.div
                  key="user-logo"
                  initial={{ scale: 0.8, rotate: -12 }}
                  animate={{ scale: 1, rotate: 12 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ rotate: 0, scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/25 cursor-default"
                >
                  <Utensils className="w-7 h-7 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="admin-logo"
                  initial={{ scale: 0.8, rotate: 12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center shadow-lg border border-gray-700 cursor-default"
                >
                  <ShieldAlert className="w-7 h-7 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title */}
          <div className="text-center mb-7">
            <AnimatePresence mode="wait">
              {loginMode === 'user' ? (
                <motion.div key="user-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="text-2xl font-black mb-1">
                    Food<span className="gradient-text">App</span>
                  </h1>
                  <p className="text-sm text-gray-500">Sign in to satisfy your cravings</p>
                </motion.div>
              ) : (
                <motion.div key="admin-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h1 className="text-2xl font-black mb-1 text-white">Admin Portal</h1>
                  <p className="text-sm text-gray-500">Restricted Access Only</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {loginMode === 'user' ? (
              !isOtpSent ? (
                <motion.form 
                  key="phone-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={sendOtp} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="input-premium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 py-3.5 bg-darker border border-r-0 border-gray-800 rounded-l-xl text-gray-500 font-medium text-sm">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="input-premium rounded-l-none border-l-0"
                        required
                      />
                    </div>
                  </div>

                  <div id="recaptcha-container"></div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 btn-primary rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form 
                  key="otp-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={verifyOtp} 
                  className="space-y-4"
                >
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-3.5 flex items-start gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-primary">Verification Code</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Sent to {phoneNumber}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="input-premium text-center tracking-[0.8em] text-xl font-bold"
                      maxLength="6"
                      required
                    />
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 btn-primary rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify & Login'
                    )}
                  </motion.button>
                  
                  <div className="text-center mt-3">
                    <button 
                      type="button" 
                      onClick={() => setIsOtpSent(false)}
                      className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      Change phone number
                    </button>
                  </div>
                </motion.form>
              )
            ) : (
              <motion.form 
                key="admin-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleAdminLogin} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Secret PIN</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      maxLength="4"
                      className="input-premium pl-11 text-center tracking-[1em] text-xl font-bold"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 text-center mt-2">Default: 1234</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-600 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>Access Dashboard <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-700 mt-4">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

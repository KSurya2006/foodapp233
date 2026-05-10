import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Utensils, ShieldCheck, Lock, ShieldAlert } from 'lucide-react';
import axios from 'axios';

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

      toast.success(`Welcome, ${name}!`);
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
      {/* Background Decor */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none transition-colors duration-500 ${loginMode === 'admin' ? 'bg-red-500/20' : 'bg-primary/20'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none transition-colors duration-500 ${loginMode === 'admin' ? 'bg-gray-600/20' : 'bg-orange-600/20'}`}></div>
      
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10 relative z-10 animate-slide-up">
          
          <div className="flex bg-darker p-1 rounded-xl border border-gray-800 mb-8">
            <button 
              onClick={() => setLoginMode('user')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginMode === 'user' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400 hover:text-white'}`}
            >
              Customer
            </button>
            <button 
              onClick={() => setLoginMode('admin')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginMode === 'admin' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Admin
            </button>
          </div>

          <div className="flex justify-center mb-8">
            {loginMode === 'user' ? (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/30 rotate-12 group hover:rotate-0 transition-transform duration-300">
                <Utensils className="w-8 h-8 text-white" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gray-800 to-gray-600 flex items-center justify-center shadow-lg border border-gray-700 group hover:rotate-12 transition-transform duration-300">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          <div className="text-center mb-8">
            {loginMode === 'user' ? (
              <>
                <h1 className="text-3xl font-extrabold mb-2">
                  Food<span className="gradient-text">App</span>
                </h1>
                <p className="text-gray-400">Sign in to crave your hunger</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold mb-2 text-white">Admin Portal</h1>
                <p className="text-gray-400">Restricted Access Only</p>
              </>
            )}
          </div>

          {loginMode === 'user' ? (
            !isOtpSent ? (
              <form onSubmit={sendOtp} className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-darker/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3 bg-darker/80 border border-r-0 border-gray-800 rounded-l-xl text-gray-400 font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full px-4 py-3 bg-darker/50 border border-gray-800 rounded-r-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600"
                      required
                    />
                  </div>
                </div>

                <div id="recaptcha-container"></div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Continue'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-5 animate-fade-in">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3 mb-6">
                  <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-primary">Verification Code</h4>
                    <p className="text-xs text-gray-400 mt-1">We've sent a 6-digit code to {phoneNumber}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full px-4 py-4 text-center tracking-[1em] text-2xl font-bold bg-darker/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600"
                    maxLength="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                
                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsOtpSent(false)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Change phone number
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Secret PIN</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    maxLength="4"
                    className="w-full pl-11 pr-4 py-4 text-center tracking-[1em] text-2xl font-bold bg-darker/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">Hint: Default PIN is 1234</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Access Dashboard'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const hearts = ['💝', '💖', '💗', '💓', '💕'];

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentHeart, setCurrentHeart] = useState(hearts[0]);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(username, password);
        if (error) throw error;
      } else {
        const { error } = await signIn(username, password);
        if (error) throw error;
      }
    } catch (error) {
      console.log('Auth error:', error);
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    // Change heart emoji on toggle
    const randomHeart = hearts[Math.floor(Math.random() * hearts.length)];
    setCurrentHeart(randomHeart);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-pink-50 rounded-2xl shadow-lg border border-pink-100"
      >
        <motion.div 
          className="text-center mb-8"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-4xl mb-3">{currentHeart}</div>
          <h2 className="text-3xl font-bold text-pink-600 mb-2">
            {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
          </h2>
          <p className="text-pink-400 text-sm">
            {isSignUp 
              ? 'Ready to share your relationship thoughts?' 
              : 'We missed your love stories!'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-pink-100 border border-pink-200 text-pink-700 rounded-lg text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-pink-700 mb-2">
              Choose your lovely username
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white placeholder-pink-300"
              required
              disabled={loading}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-pink-700 mb-2">
              Your secret love code
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white placeholder-pink-300"
              required
              disabled={loading}
              minLength={6}
              placeholder="Enter password"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading || !username || !password}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-6 rounded-xl text-white font-medium text-lg ${
              loading || !username || !password
                ? 'bg-pink-300 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-200'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span>{isSignUp ? 'Start Sharing 💝' : 'Welcome Back 💖'}</span>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <motion.button
            onClick={toggleMode}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            className={`text-sm text-pink-600 hover:text-pink-700 font-medium ${
              loading ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            {isSignUp
              ? 'Already have an account? Sign in with love'
              : "Don't have an account? Sign up for love"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}; 
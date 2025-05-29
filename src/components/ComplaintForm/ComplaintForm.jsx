import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const moods = ['😊', '😢', '😡', '🥺', '💔', '😤', '🙄', '😒'];
const categories = ['Communication', 'Date Night', 'Daily Life', 'Quality Time', 'Boundaries', 'Other'];
const severityLevels = [
  { value: 'low', label: 'Minor Issue 💭', color: 'bg-pink-100 text-pink-700' },
  { value: 'medium', label: 'Need to Talk 💌', color: 'bg-pink-200 text-pink-800' },
  { value: 'high', label: 'Serious Problem ❗', color: 'bg-pink-300 text-pink-900' }
];

export const ComplaintForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState(moods[0]);
  const [category, setCategory] = useState(categories[0]);
  const [severity, setSeverity] = useState('low');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    console.log('Submitting complaint:', {
      title,
      description,
      mood,
      category,
      severity,
      created_at: new Date().toISOString()
    });

    const success = await onSubmit({
      title,
      description,
      mood,
      category,
      severity,
      created_at: new Date().toISOString()
    });

    console.log('Submission result:', success);

    if (success) {
      setTitle('');
      setDescription('');
      setMood(moods[0]);
      setCategory(categories[0]);
      setSeverity('low');
      setIsExpanded(false);
    }
  };

  return (
    <motion.div
      className="bg-pink-50/50 rounded-2xl shadow-lg border border-pink-100 p-6 mb-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.div whileHover={{ scale: 1.02 }}>
          <h2 className="text-2xl font-bold text-pink-600">Share What's Up 💭</h2>
          <p className="text-sm text-pink-400 mt-1">Express yourself - good, bad, or in between</p>
        </motion.div>
        <motion.button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="text-pink-400 hover:text-pink-600 transition-colors"
        >
          <svg
            className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-2">
                  How are you feeling?
                </label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((m) => (
                    <motion.button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`text-2xl p-2 rounded-full ${
                        mood === m ? 'bg-pink-100 shadow-md' : 'hover:bg-pink-50'
                      }`}
                    >
                      {m}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pink-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white text-pink-700"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-pink-700 mb-2">
                  How Serious Is It?
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full p-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white text-pink-700"
                >
                  {severityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-pink-700 mb-2">
                What's the Issue?
              </label>
              <motion.input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                className="w-full p-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white placeholder-pink-300"
                placeholder="Give your complaint a title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pink-700 mb-2">
                Tell Us More
              </label>
              <motion.textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                className="w-full p-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white placeholder-pink-300 min-h-[120px] resize-y"
                placeholder="What happened? How do you feel about it?"
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-6 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-xl shadow-lg shadow-pink-200 text-lg"
            >
              Share Your Thoughts
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <motion.button
          onClick={() => setIsExpanded(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-6 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-xl shadow-lg shadow-pink-200 text-lg flex items-center justify-center gap-2"
        >
          <span>What's on your mind? {mood}</span>
        </motion.button>
      )}
    </motion.div>
  );
};
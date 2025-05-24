import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { moods } from '../ComplaintCard/ComplaintCard';

const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export const ComplaintForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState(moods[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return;
    onSubmit({ id: generateId(), title, description, mood, timestamp: new Date(), reply: '', reaction: '' });
    setTitle('');
    setDescription('');
    setMood(moods[0]);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="p-2 bg-dark-100 mb-6 space-y-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <h2 className="text-xl font-bold text-gray-200 mb-0">Submit a Complaint 💌</h2>
      <small className='block mb-4 text-gray-400'>and I will think about it (maybe)</small>

      <div className='p-2 bg-gray-200'>
        <div className='px-0 py-1'>
          <label className="mb-1 font-medium hidden"></label>
          <input
            className="w-full p-2 border"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className='px-0 py-2 bg-gray-100'>
          <label className="mb-1 font-medium hidden"></label>
          <textarea
            className="w-full p-2 border"
            rows={3}
            placeholder="What's bothering you?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className='px-0 py-2 bg-gray-100'>
          <label className="mb-1 font-medium hidden"></label>
          <div className="flex gap-3">
            {moods.map((m) => (
              <label key={m} className="cursor-pointer text-2xl">
                <input
                  type="radio"
                  name="mood"
                  value={m}
                  checked={mood === m}
                  onChange={(e) => setMood(e.target.value)}
                  className="hidden"
                />
                <span className={`inline-block px-2 py-1 transition-all ${mood === m ? 'bg-pink-300' : 'hover:bg-pink-200'}`}>
                  {m}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className='text-right'>
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
          Submit
        </button>
      </div>
    </motion.form>
  );
};
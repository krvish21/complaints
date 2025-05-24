import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const moods = ['😊', '😡', '😢', '🥺', '😂'];

export const ComplaintCard = ({ complaint, onReply, onReact }) => {
  const [reply, setReply] = useState(complaint.reply);
  const [reaction, setReaction] = useState(complaint.reaction);

  return (
    <motion.div
      className="bg-white shadow p-4 mb-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h3 className="font-bold text-left">{complaint.mood}  {complaint.title}</h3>
      <p className="text-xs text-left text-gray-500 mb-2">{new Date(complaint.timestamp).toLocaleString()}</p>
      <p className="text-sm text-left text-gray-700 mb-1">{complaint.description}</p>
      <div className="mx-2 text-left">
        <span className='text-xs'><select
          className="mt-1 p-1 rounded border-none outline-none"
          value={reaction}
          onChange={(e) => {
            setReaction(e.target.value);
            onReact(complaint.id, e.target.value);
          }}
        >
          <option value=""></option>
          {moods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select></span>
        <span className='mx-4 text-xs'>2 replies</span>
      </div>
    </motion.div>
  );
};

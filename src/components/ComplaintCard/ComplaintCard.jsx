import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export const moods = ['😊', '😡', '😢', '🥺', '😂'];

const SeverityBadge = ({ severity }) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity] || colors.low}`}>
      {severity?.toUpperCase()}
    </span>
  );
};

const CategoryBadge = ({ category }) => (
  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
    {category}
  </span>
);

export const ComplaintCard = ({ complaint, onReply, onReact }) => {
  const [reply, setReply] = useState(complaint.reply || '');
  const [isReplying, setIsReplying] = useState(false);
  const [reaction, setReaction] = useState(complaint.reaction);

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (reply.trim()) {
      onReply(complaint.id, reply);
      setIsReplying(false);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-4 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            {complaint.mood} {complaint.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <time dateTime={complaint.created_at}>
              {format(new Date(complaint.created_at), 'MMM d, yyyy • h:mm a')}
            </time>
          </div>
        </div>
        <div className="flex gap-2">
          {complaint.category && <CategoryBadge category={complaint.category} />}
          {complaint.severity && <SeverityBadge severity={complaint.severity} />}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-4 mb-4 pt-4 border-t border-gray-100">
        <div className="relative">
          <select
            className="appearance-none bg-gray-50 hover:bg-gray-100 transition-colors rounded-full px-4 py-2 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={reaction || ''}
            onChange={(e) => {
              setReaction(e.target.value);
              onReact(complaint.id, e.target.value);
            }}
          >
            <option value="">Add reaction...</option>
            {moods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        <button
          onClick={() => setIsReplying(!isReplying)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Reply
        </button>
      </div>

      {/* Reply Form */}
      <AnimatePresence>
        {isReplying && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitReply}
            className="overflow-hidden"
          >
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit Reply
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Existing Reply */}
      {complaint.reply && !isReplying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pl-4 border-l-2 border-gray-200"
        >
          <p className="text-sm text-gray-700">{complaint.reply}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

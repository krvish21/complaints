import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export const moods = ['😊', '😢', '😡', '🥺', '💔', '😤', '🙄', '😒'];

const SeverityBadge = ({ severity }) => {
  const colors = {
    low: 'bg-pink-100 text-pink-700',
    medium: 'bg-pink-200 text-pink-800',
    high: 'bg-pink-300 text-pink-900',
  };

  const labels = {
    low: 'Minor Issue 💭',
    medium: 'Need to Talk 💌',
    high: 'Serious Problem ❗'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[severity] || colors.low}`}>
      {labels[severity] || 'Minor Issue'}
    </span>
  );
};

const CategoryBadge = ({ category }) => (
  <span className="px-3 py-1 rounded-full text-sm font-medium bg-pink-50 text-pink-600 border border-pink-200">
    {category}
  </span>
);

const UserBadge = ({ username, isAuthor }) => (
  <span className={`inline-flex items-center gap-1 text-sm ${isAuthor ? 'text-pink-600' : 'text-pink-400'}`}>
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
    </svg>
    {username}
  </span>
);

const Reply = ({ reply, currentUser }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pl-4 border-l-2 border-pink-100 mb-3"
  >
    <div className="flex items-center gap-2 mb-1">
      <UserBadge username={reply.user.username} isAuthor={reply.user.id === currentUser?.id} />
      <span className="text-xs text-pink-300">
        {format(new Date(reply.created_at), 'MMM d, yyyy • h:mm a')}
      </span>
    </div>
    <p className="text-sm text-pink-700">{reply.content}</p>
  </motion.div>
);

export const ComplaintCard = ({ complaint, onReply, onReact, currentUser }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(complaint.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6 hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-pink-600 mb-2 flex items-center gap-2">
            {complaint.mood} {complaint.title}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <UserBadge username={complaint.user.username} isAuthor={complaint.user.id === currentUser?.id} />
            <span className="text-xs text-pink-300">
              {format(new Date(complaint.created_at), 'MMM d, yyyy • h:mm a')}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-pink-700 whitespace-pre-wrap">{complaint.description}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <SeverityBadge severity={complaint.severity} />
        <CategoryBadge category={complaint.category} />
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-4 mb-4 pt-4 border-t border-pink-50">
        <div className="relative">
          <select
            className="appearance-none bg-pink-50 hover:bg-pink-100 transition-colors rounded-full px-4 py-2 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={complaint.userReaction || ''}
            onChange={(e) => onReact(complaint.id, e.target.value)}
          >
            <option value="">React to this...</option>
            {moods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pink-600">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        <div className="flex gap-1">
          {complaint.reactions?.map((r, index) => (
            <motion.span
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              title={r.user.username}
              className="text-2xl"
            >
              {r.reaction}
            </motion.span>
          ))}
        </div>
        <motion.button
          onClick={() => setIsReplying(!isReplying)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Reply
        </motion.button>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        {complaint.replies?.map((reply) => (
          <Reply key={reply.id} reply={reply} currentUser={currentUser} />
        ))}

        <AnimatePresence>
          {isReplying && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmitReply}
              className="overflow-hidden"
            >
              <motion.textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your response..."
                className="w-full p-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 bg-white placeholder-pink-300 min-h-[100px] resize-y mb-3"
                whileFocus={{ scale: 1.01 }}
              />
              <div className="flex justify-end gap-2">
                <motion.button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm text-pink-600 hover:text-pink-700"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm shadow-md shadow-pink-200"
                >
                  Send Response
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

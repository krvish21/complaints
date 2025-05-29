import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { moodThemes } from '../../lib/themes';
import { CompensationPopup } from '../CompensationPopup/CompensationPopup';
import { ScratchCard } from '../ScratchCard/ScratchCard';

export const moods = ['😊', '😢', '😡', '🥺', '💔', '😤', '🙄', '😒'];

const SeverityBadge = ({ severity, theme }) => {
  const severityColors = {
    low: theme.secondary + ' ' + theme.text,
    medium: theme.primary + ' text-white',
    high: theme.primary + ' text-white font-bold',
  };

  const labels = {
    low: 'Just saying ' + theme.emoji,
    medium: 'We should talk ' + theme.emoji,
    high: 'Important ' + theme.emoji
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${severityColors[severity] || severityColors.low}`}>
      {labels[severity] || 'Just saying'}
    </span>
  );
};

const CategoryBadge = ({ category, theme }) => (
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme.lightBg} ${theme.text} border ${theme.border}`}>
    {category}
  </span>
);

const UserBadge = ({ username, isAuthor, theme }) => (
  <span className={`inline-flex items-center gap-1 text-sm ${isAuthor ? theme.accent : 'text-gray-500'}`}>
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
    </svg>
    {username}
  </span>
);

const Reply = ({ reply, currentUser, theme, onAddCompensation, onRevealCompensation }) => {
  const [showCompensationPopup, setShowCompensationPopup] = useState(false);
  const [showScratchCards, setShowScratchCards] = useState(false);
  const isVishu = currentUser?.name === 'Vishu';
  const isSabaa = currentUser?.name === 'Sabaa';
  const compensation = reply.compensations?.[0];
  const canShowCompensation = isVishu && !compensation;
  const canRevealCompensation = isSabaa && compensation?.status === 'pending';

  const handleCompensationSubmit = (options) => {
    onAddCompensation(reply.id, options);
  };

  const handleCompensationReveal = (selectedOption) => {
    onRevealCompensation(compensation.id, selectedOption);
    setShowScratchCards(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-end gap-2 text-sm group"
      >
        <div className={`flex items-center gap-2 max-w-[85%] ${theme.text}`}>
          <span className="text-xs text-gray-400 group-hover:opacity-100 opacity-50">
            {format(new Date(reply.created_at), 'h:mm a')}
          </span>
          <span className="mx-1 text-gray-300">•</span>
          <span className={`font-medium ${reply.user.id === currentUser?.id ? theme.accent : 'text-gray-700'}`}>
            {reply.user.username}:
          </span>
          <span className="text-gray-600 break-words">{reply.content}</span>
          
          {compensation?.status === 'revealed' && (
            <span className={`ml-2 ${theme.accent}`}>
              🎁 {compensation.selected_option}
            </span>
          )}

          {(canShowCompensation || canRevealCompensation) && (
            <button
              onClick={() => canShowCompensation ? setShowCompensationPopup(true) : setShowScratchCards(true)}
              className={`ml-2 text-sm font-medium text-pink-600 hover:text-pink-700 hover:underline transition-colors`}
            >
              {canShowCompensation ? '+ Make it up to you' : '🎁 Open your surprise'}
            </button>
          )}
        </div>
      </motion.div>

      <CompensationPopup
        isOpen={showCompensationPopup}
        onClose={() => setShowCompensationPopup(false)}
        onSubmit={handleCompensationSubmit}
        theme={theme}
      />

      {/* Show all options as scratch cards */}
      <AnimatePresence>
        {showScratchCards && compensation?.options && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowScratchCards(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-4xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className={`text-xl font-semibold ${theme.accent} mb-6`}>
                Pick your surprise! 🎁
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...compensation.options]
                  .sort(() => Math.random() - 0.5)
                  .map((option, index) => (
                  <ScratchCard
                    key={index}
                    isOpen={true}
                    onClose={() => {}}
                    options={[option]}
                    onReveal={handleCompensationReveal}
                    theme={theme}
                    disabled={compensation.status === 'revealed'}
                    firstRevealed={index === 0}
                  />
                ))}
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowScratchCards(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const ComplaintCard = ({ complaint, onReply, onReact, onAddCompensation, onRevealCompensation, currentUser }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const theme = moodThemes[complaint.mood] || moodThemes['😊'];
  const replyCount = complaint.replies?.length || 0;

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(complaint.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
      setShowReplies(true); // Show replies after posting
    }
  };

  return (
    <motion.div
      className={`rounded-2xl shadow-lg border ${theme.border} p-6 hover:shadow-xl transition-shadow bg-gradient-to-br ${theme.gradient} bg-opacity-5`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-xl font-semibold ${theme.accent} mb-2 flex items-center gap-2`}>
            {complaint.mood} {complaint.title}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <UserBadge 
              username={complaint.user.username} 
              isAuthor={complaint.user.id === currentUser?.id}
              theme={theme}
            />
            <span className="text-xs text-gray-400">
              {format(new Date(complaint.created_at), 'MMM d, yyyy • h:mm a')}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className={`${theme.text} whitespace-pre-wrap`}>{complaint.description}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <SeverityBadge severity={complaint.severity} theme={theme} />
        <CategoryBadge category={complaint.category} theme={theme} />
      </div>

      {/* Reactions and Reply Button */}
      <div className={`flex items-center gap-4 pt-4 border-t ${theme.border}`}>
        <div className="relative">
          <select
            className={`appearance-none ${theme.lightBg} ${theme.hover} transition-colors rounded-full px-4 py-1.5 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 ring-offset-2 ${theme.border}`}
            value={complaint.userReaction || ''}
            onChange={(e) => onReact(complaint.id, e.target.value)}
          >
            <option value="">React...</option>
            {moods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${theme.accent}`}>
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
        <div className="flex-1 flex items-center justify-end gap-4">
          {replyCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={`text-sm ${theme.accent} hover:underline flex items-center gap-1`}
            >
              {replyCount} {replyCount === 1 ? 'thought' : 'thoughts'}
              <svg
                className={`w-4 h-4 transform transition-transform ${showReplies ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setIsReplying(!isReplying)}
            className={`text-sm ${theme.accent} hover:underline flex items-center gap-1`}
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        </div>
      </div>

      {/* Replies Section */}
      <AnimatePresence>
        {(showReplies || isReplying) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Existing Replies */}
            {showReplies && complaint.replies?.length > 0 && (
              <div className={`mt-4 space-y-1.5 pt-3 border-t ${theme.border}`}>
                {complaint.replies.map((reply) => (
                  <Reply
                    key={reply.id}
                    reply={reply}
                    currentUser={currentUser}
                    theme={theme}
                    onAddCompensation={onAddCompensation}
                    onRevealCompensation={onRevealCompensation}
                  />
                ))}
              </div>
            )}
            
            {/* Reply Form */}
            {isReplying && (
              <motion.form
                onSubmit={handleSubmitReply}
                className={`mt-4 flex gap-2 items-center pt-3 ${showReplies ? '' : `border-t ${theme.border}`}`}
              >
                <div className="flex-1 flex justify-end">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className={`w-[85%] p-2 text-sm border rounded-lg ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text} placeholder-gray-400`}
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 ${theme.primary} text-white rounded-lg text-sm shadow-md`}
                >
                  Send
                </motion.button>
              </motion.form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

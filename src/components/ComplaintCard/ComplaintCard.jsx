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
    <span className={`px-2 py-0.5 rounded-full text-xs ${severityColors[severity] || severityColors.low}`}>
      {labels[severity] || 'Just saying'}
    </span>
  );
};

const CategoryBadge = ({ category, theme }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme.lightBg} ${theme.text} border ${theme.border}`}>
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

const Toast = ({ message, type = 'primary', theme }) => {
  const styles = {
    primary: `${theme.primary} text-white`,
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg
        ${styles[type]} text-sm font-medium z-50`}
    >
      {message}
    </motion.div>
  );
};

const Reply = ({ reply, currentUser, theme, onAddCompensation, onRevealCompensation }) => {
  const [showCompensationPopup, setShowCompensationPopup] = useState(false);
  const [showScratchCards, setShowScratchCards] = useState(false);
  const [firstScratchedIndex, setFirstScratchedIndex] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'primary' });
  const isVishu = currentUser?.name === 'Vishu';
  const isSabaa = currentUser?.name === 'Sabaa';
  const compensation = reply.compensations?.[0];
  const canShowCompensation = isVishu && !compensation;
  const canRevealCompensation = isSabaa && compensation?.status === 'pending';

  const showToast = (message, type = 'primary') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'primary' }), 3000);
  };

  const handleCompensationClick = () => {
    if (canShowCompensation) {
      setShowCompensationPopup(true);
    } else if (canRevealCompensation) {
      setShowScratchCards(true);
    } else if (isVishu && compensation) {
      showToast("You've already added some sweet surprises! 🎁 Let Sabaa pick one first! 💝", 'warning');
    }
  };

  const handleCompensationSubmit = (options) => {
    onAddCompensation(reply.id, options);
    showToast('Sweet surprises added successfully! 🎁 Now wait for Sabaa to pick one! ✨', 'success');
  };

  const handleCompensationReveal = (selectedOption) => {
    onRevealCompensation(compensation.id, selectedOption);
    setShowScratchCards(false);
    showToast('Yay! You picked a sweet surprise! 🎉 Hope it makes you smile! 💖', 'success');
  };

  const handleCardScratched = (index) => {
    if (firstScratchedIndex === null) {
      setFirstScratchedIndex(index);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-end gap-1"
      >
        <div className="max-w-[85%] bg-white rounded-lg p-2 shadow-sm">
          <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
            <span>{format(new Date(reply.created_at), 'h:mm a')}</span>
            <span>•</span>
            <span className={`font-medium ${reply.user.id === currentUser?.id ? theme.accent : 'text-gray-700'}`}>
              {reply.user.username}
            </span>
          </div>
          
          <div className="flex flex-col items-end gap-1 mt-1">
            <p className="text-sm text-gray-600 break-words text-right">{reply.content}</p>
            
            {compensation?.status === 'revealed' && (
              <span className={`text-sm ${theme.accent} text-right`}>
                🎁 {compensation.selected_option}
              </span>
            )}

            {(canShowCompensation || canRevealCompensation || (isVishu && compensation)) && (
              <button
                onClick={handleCompensationClick}
                className={`text-xs font-medium text-pink-600 hover:text-pink-700 hover:underline transition-colors`}
              >
                {canShowCompensation ? '+ Make it up to you' : canRevealCompensation ? '🎁 Open your surprise' : '✨ Already added surprises'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <CompensationPopup
        isOpen={showCompensationPopup}
        onClose={() => setShowCompensationPopup(false)}
        onSubmit={handleCompensationSubmit}
        theme={theme}
      />

      <AnimatePresence>
        {toast.show && (
          <Toast 
            message={toast.message}
            type={toast.type}
            theme={theme} 
          />
        )}
      </AnimatePresence>

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
                      isFirstScratched={index === firstScratchedIndex}
                      onScratched={() => handleCardScratched(index)}
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
      setShowReplies(true);
    }
  };

  return (
    <motion.div
      className={`rounded-xl shadow-lg border ${theme.border} overflow-hidden bg-white`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className={`p-3 border-b ${theme.border} bg-gradient-to-br ${theme.gradient} bg-opacity-5`}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl shrink-0">{complaint.mood}</span>
              <h3 className={`text-base font-semibold ${theme.accent} break-words`}>
                {complaint.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <SeverityBadge severity={complaint.severity} theme={theme} />
              <CategoryBadge category={complaint.category} theme={theme} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <UserBadge username={complaint.user.username} isAuthor={complaint.user.id === currentUser?.id} theme={theme} />
            <span>•</span>
            <span>{format(new Date(complaint.created_at), 'MMM d • h:mm a')}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3">
        <p className={`${theme.text} text-sm whitespace-pre-wrap mb-4`}>{complaint.description}</p>

        {/* Reactions Section */}
        <div className="flex items-center gap-3">
          <select
            className={`appearance-none ${theme.lightBg} ${theme.hover} transition-colors rounded-full px-3 py-1 text-xs cursor-pointer focus:outline-none focus:ring-2 ring-offset-2 ${theme.border}`}
            value={complaint.userReaction || ''}
            onChange={(e) => onReact(complaint.id, e.target.value)}
          >
            <option value="">React...</option>
            {moods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="flex gap-0.5">
            {complaint.reactions?.map((r, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                title={r.user.username}
                className="text-lg"
              >
                {r.reaction}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Replies Section */}
      <div className={`border-t ${theme.border} bg-gray-50`}>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={`text-xs ${theme.accent} hover:underline flex items-center gap-1`}
            >
              {replyCount > 0 ? (
                <>
                  {replyCount} {replyCount === 1 ? 'thought' : 'thoughts'}
                  <svg
                    className={`w-3 h-3 transform transition-transform ${showReplies ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              ) : (
                'Share your thoughts'
              )}
            </button>
            {!isReplying && (
              <button
                onClick={() => setIsReplying(true)}
                className={`text-xs ${theme.accent} hover:underline`}
              >
                Reply
              </button>
            )}
          </div>

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
                  <div className="mt-3 space-y-2">
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
                    className="mt-3 flex flex-col gap-2"
                  >
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your thoughts..."
                      className={`w-full p-2 text-sm border rounded-lg ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text} placeholder-gray-400`}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsReplying(false)}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!replyContent.trim()}
                        className={`px-3 py-1 ${theme.primary} text-white rounded-lg text-xs shadow-sm disabled:opacity-50`}
                      >
                        Send
                      </button>
                    </div>
                  </motion.form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

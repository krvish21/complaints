import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { moodThemes } from '../../lib/themes';
import { CompensationPopup } from '../CompensationPopup/CompensationPopup';
import { ScratchCard } from '../ScratchCard/ScratchCard';
import { useUser } from '../../contexts/UserContext';

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
  const { isVishu, isSabaa } = useUser();
  
  // Debug logging for all props
  console.log('Reply props:', {
    reply,
    currentUser,
    hasCompensation: reply.hasCompensation,
    compensations: reply.compensations,
    replyUser: reply.user,
    currentUserData: currentUser
  });

  // Ensure we have valid user objects
  if (!reply.user?.id || !currentUser?.user_id) {
    console.error('Invalid user data:', { 
      replyUser: reply.user, 
      currentUser,
      replyUserId: reply.user?.id,
      currentUserId: currentUser?.user_id
    });
    return null;
  }

  // User role checks
  const isReplyFromSabaa = reply.user.username === 'Sabaa';
  const compensation = reply.compensations?.[0];
  
  // Compensation state checks
  const hasExistingCompensation = reply.compensations && reply.compensations.length > 0;
  const isPendingCompensation = compensation?.status === 'pending';
  const isRevealedCompensation = compensation?.status === 'revealed';

  // Permission checks
  const canShowCompensation = isVishu && isReplyFromSabaa && !hasExistingCompensation;
  const canRevealCompensation = isSabaa && isPendingCompensation;

  // Debug logging for visibility conditions
  console.log('Compensation visibility:', {
    isVishu,
    isSabaa,
    isReplyFromSabaa,
    hasExistingCompensation,
    isPendingCompensation,
    canShowCompensation,
    canRevealCompensation,
    compensation,
    replyUserId: reply.user.id,
    currentUserId: currentUser.user_id,
    replyUsername: reply.user.username,
    currentUsername: currentUser.username
  });

  const showToast = (message, type = 'primary') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'primary' }), 3000);
  };

  const handleCompensationClick = () => {
    console.log('Compensation button clicked:', {
      canShowCompensation,
      canRevealCompensation,
      hasExistingCompensation,
      replyUserId: reply.user.id,
      currentUserId: currentUser.user_id
    });

    if (!isReplyFromSabaa) {
      showToast("Compensations can only be added to Sabaa's replies! 💝", 'warning');
      return;
    }

    if (canShowCompensation) {
      setShowCompensationPopup(true);
    } else if (canRevealCompensation) {
      setShowScratchCards(true);
    } else if (isVishu && hasExistingCompensation) {
      showToast("You've already added some sweet surprises! 🎁 Let Sabaa pick one first! 💝", 'warning');
    } else if (isSabaa && isRevealedCompensation) {
      showToast("You've already revealed this surprise! 🎁", 'info');
    }
  };

  const handleCompensationSubmit = async (options) => {
    if (!isVishu) {
      showToast('Only Vishu can add compensations! 🤗', 'warning');
      return;
    }

    if (!isReplyFromSabaa) {
      showToast("Compensations can only be added to Sabaa's replies! 💝", 'warning');
      return;
    }

    if (hasExistingCompensation) {
      showToast("This reply already has a compensation! 🎁", 'warning');
      return;
    }

    console.log('Submitting compensation:', { 
      replyId: reply.id, 
      options,
      replyUserId: reply.user.id,
      currentUserId: currentUser.user_id
    });
    
    const success = await onAddCompensation(reply.id, options);
    
    if (success) {
      setShowCompensationPopup(false);
      showToast('Sweet surprises added successfully! 🎁 Now wait for Sabaa to pick one! ✨', 'success');
    } else {
      showToast('Oops! Could not add the surprises. Please try again! 🙈', 'warning');
    }
  };

  const handleCompensationReveal = async (selectedOption) => {
    if (!isSabaa) {
      showToast('Only Sabaa can reveal compensations! 🤗', 'warning');
      return;
    }

    if (!isPendingCompensation) {
      showToast('This compensation has already been revealed! 🎁', 'warning');
      return;
    }

    console.log('Revealing compensation:', { 
      compensationId: compensation?.id, 
      selectedOption,
      replyUserId: reply.user.id,
      currentUserId: currentUser.user_id
    });

    if (!compensation?.id) {
      console.error('No compensation ID found');
      showToast('Oops! Something went wrong. Please try again! 🙈', 'warning');
      return;
    }

    const success = await onRevealCompensation(compensation.id, selectedOption);
    
    if (success) {
      setShowScratchCards(false);
      showToast('Yay! You picked a sweet surprise! 🎉 Hope it makes you smile! 💖', 'success');
    } else {
      showToast('Oops! Could not reveal the surprise. Please try again! 🙈', 'warning');
    }
  };

  const handleCardScratched = (index) => {
    if (firstScratchedIndex === null) {
      setFirstScratchedIndex(index);
    }
  };

  const renderCompensationButton = () => {
    console.log('Rendering compensation button:', {
      canShowCompensation,
      canRevealCompensation,
      hasExistingCompensation,
      replyUserId: reply.user.id,
      currentUserId: currentUser.user_id
    });

    if (canShowCompensation) {
      return (
        <button
          onClick={handleCompensationClick}
          className={`text-xs font-medium text-pink-600 hover:text-pink-700 hover:underline transition-colors`}
        >
          + Make it up to you
        </button>
      );
    }
    
    if (canRevealCompensation) {
      return (
        <button
          onClick={handleCompensationClick}
          className={`text-xs font-medium text-pink-600 hover:text-pink-700 hover:underline transition-colors`}
        >
          🎁 Open your surprise
        </button>
      );
    }

    if (isVishu && hasExistingCompensation && isPendingCompensation) {
      return (
        <span className={`text-xs font-medium text-gray-500`}>
          Waiting for Sabaa to pick a surprise 🎁
        </span>
      );
    }

    if (isRevealedCompensation) {
      return (
        <span className={`text-xs font-medium text-gray-500`}>
          Surprise revealed! 🎉
        </span>
      );
    }

    return null;
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
            <span className={`font-medium ${reply.user.id === currentUser.user_id ? theme.accent : 'text-gray-700'}`}>
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

            {renderCompensationButton()}
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
                {compensation.options.map((option, index) => (
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
  const [replyError, setReplyError] = useState(null);
  const theme = moodThemes[complaint.mood] || moodThemes['😊'];
  const replyCount = complaint.replies?.length || 0;

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    setReplyError(null);

    if (!replyContent.trim()) {
      setReplyError('Please enter a reply');
      return;
    }

    console.log('Submitting reply for complaint:', {
      complaintId: complaint.id,
      content: replyContent,
      currentUser
    });

    try {
      const success = await onReply(complaint.id, replyContent);
      console.log('Reply submission result:', success);

      if (success) {
        setReplyContent('');
        setIsReplying(false);
        setShowReplies(true);
      } else {
        setReplyError('Failed to submit reply. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      setReplyError('An unexpected error occurred. Please try again.');
    }
  };

  console.log('ComplaintCard render:', {
    complaintId: complaint.id,
    replyCount,
    replies: complaint.replies,
    currentUser
  });

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
                    <div className="relative">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your thoughts..."
                        className={`w-full p-2 text-sm border rounded-lg ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text} placeholder-gray-400 ${
                          replyError ? 'border-red-500' : ''
                        }`}
                      />
                      {replyError && (
                        <p className="text-xs text-red-500 mt-1">{replyError}</p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplying(false);
                          setReplyError(null);
                          setReplyContent('');
                        }}
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

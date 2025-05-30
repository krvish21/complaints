import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { moodThemes } from '../../lib/themes';
import { CompensationPopup } from '../CompensationPopup/CompensationPopup';
import { ScratchCard } from '../ScratchCard/ScratchCard';
import { EscalationControls, StatusDropdown } from '../EscalationControls/EscalationControls';
import { useUser } from '../../contexts/UserContext';

export const moods = ['😊', '😢', '😡', '🥺', '💔', '😤', '🙄', '😒'];

const UserBadge = ({ username, isAuthor, theme }) => (
  <div className={`flex items-center gap-2 ${isAuthor ? theme.accent : 'text-gray-500'}`}>
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
    </svg>
    <span className="font-medium">{username}</span>
  </div>
);

const CategoryBadge = ({ category, theme }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme.lightBg} ${theme.text} border ${theme.border}`}>
    {category}
  </span>
);

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
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[severity] || severityColors.low}`}>
      {labels[severity] || 'Just saying'}
    </span>
  );
};

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

const StatusBadge = ({ status, theme }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    upheld: 'bg-red-100 text-red-800 border-red-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    ok: `${theme.lightBg} ${theme.text} ${theme.border}`
  };

  const statusIcons = {
    pending: '⏳',
    upheld: '⚠️',
    resolved: '✅',
    ok: '👌'
  };

  return (
    <span className={`
      px-3 py-1 rounded-full text-xs font-medium border
      ${statusStyles[status] || statusStyles.pending}
    `}>
      {statusIcons[status]} {status}
    </span>
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
  if (!reply.user?.user_id || !currentUser?.user_id) {
    console.error('Invalid user data:', { 
      replyUser: reply.user, 
      currentUser,
      replyUserId: reply.user?.user_id,
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
    replyUserId: reply.user.user_id,
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
      replyUserId: reply.user.user_id,
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
      replyUserId: reply.user.user_id,
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
      replyUserId: reply.user.user_id,
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
      replyUserId: reply.user.user_id,
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
            <span className={`font-medium ${reply.user.user_id === currentUser.user_id ? theme.accent : 'text-gray-700'}`}>
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

export const ComplaintCard = ({ 
  complaint, 
  onReply, 
  onEscalate,
  onCreatePlea,
  onResolvePlea,
  onAddCompensation, 
  onRevealCompensation, 
  currentUser 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const theme = moodThemes[complaint.mood] || moodThemes['😊'];
  const replyCount = complaint.replies?.length || 0;
  const { isVishu, isSabaa } = useUser();

  const handleEscalate = (status) => {
    onEscalate(complaint.id, status);
    setShowActions(false);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    setReplyError(null);

    if (!replyContent.trim()) {
      setReplyError('Please enter a reply');
      return;
    }

    try {
      const success = await onReply(complaint.id, replyContent);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-lg mb-4 overflow-hidden ${theme.bg} border ${theme.border}`}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserBadge username={complaint.user.username} isAuthor theme={theme} />
            <span className="text-xl">{complaint.mood}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={complaint.category} theme={theme} />
            <SeverityBadge severity={complaint.severity} theme={theme} />
            <StatusBadge status={complaint.status} theme={theme} />
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-2">
          {/* Title */}
          <h3 className={`text-sm sm:text-base font-medium ${theme.accent} text-left`}>
            {complaint.title || 'Untitled'}
          </h3>

          {/* Description */}
          <p className={`text-sm leading-relaxed ${theme.text} opacity-90 text-left`}>
            {complaint.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className={`text-xs ${theme.text} opacity-75`}>
              {format(new Date(complaint.created_at), 'MMM d, yyyy • h:mm a')}
            </span>
            {isSabaa && (
              <button
                onClick={() => setShowActions(!showActions)}
                className={`text-sm ${theme.accent} hover:underline flex items-center gap-1.5`}
              >
                Action
                <svg
                  className={`w-4 h-4 transform transition-transform ${showActions ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => handleEscalate('ok')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border ${theme.border} hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center gap-1`}
                  >
                    <span className="text-base">👌</span>
                    <span>Mark as OK</span>
                  </button>
                  <button
                    onClick={() => handleEscalate('upheld')}
                    className="px-3 py-2 rounded-lg text-xs font-medium border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 transition-colors duration-200 flex flex-col items-center gap-1"
                  >
                    <span className="text-base">⚠️</span>
                    <span>Uphold</span>
                  </button>
                  <button
                    onClick={() => handleEscalate('resolved')}
                    className="px-3 py-2 rounded-lg text-xs font-medium border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-colors duration-200 flex flex-col items-center gap-1"
                  >
                    <span className="text-base">✅</span>
                    <span>Resolved</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Replies Section */}
      <div className={`border-t ${theme.border} bg-white/20`}>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className={`text-sm ${theme.accent} hover:underline flex items-center gap-1.5`}
              >
                {replyCount > 0 ? (
                  <>
                    {replyCount} {replyCount === 1 ? 'thought' : 'thoughts'}
                    <svg
                      className={`w-4 h-4 transform transition-transform ${showReplies ? 'rotate-180' : ''}`}
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
                  className={`text-sm ${theme.accent} hover:underline`}
                >
                  Reply
                </button>
              )}
            </div>
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
                  <div className="mt-4 space-y-3">
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

                {/* Plea Section - Show when complaint is upheld */}
                {complaint.status === 'upheld' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <EscalationControls
                      complaint={complaint}
                      onEscalate={onEscalate}
                      onCreatePlea={onCreatePlea}
                      onResolvePlea={onResolvePlea}
                      theme={theme}
                    />
                  </div>
                )}

                {/* Reply Form */}
                {isReplying && (
                  <motion.form
                    onSubmit={handleSubmitReply}
                    className="mt-4 space-y-3"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your thoughts..."
                        className={`w-full p-3 text-sm border rounded-lg bg-white/50 ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text} placeholder-gray-400 ${
                          replyError ? 'border-red-500' : ''
                        }`}
                      />
                      {replyError && (
                        <p className="text-xs text-red-500 mt-1">{replyError}</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplying(false);
                          setReplyError(null);
                          setReplyContent('');
                        }}
                        className={`w-full sm:w-auto px-4 py-2 text-sm bg-white/50 ${theme.text} hover:bg-white/70 border ${theme.border} rounded-lg`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!replyContent.trim()}
                        className={`w-full sm:w-auto px-4 py-2 ${theme.primary} text-white rounded-lg text-sm shadow-sm disabled:opacity-50`}
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

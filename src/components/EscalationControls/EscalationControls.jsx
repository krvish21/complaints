import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';

const StatusDropdown = ({ currentStatus, onChange, theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: 'pending', label: '⏳ Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'upheld', label: '⚠️ Upheld', color: 'bg-red-100 text-red-800' },
    { value: 'resolved', label: '✅ Resolved', color: 'bg-green-100 text-green-800' },
    { value: 'ok', label: '👌 OK', color: `${theme.lightBg} ${theme.text}` }
  ];

  const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs
          border ${theme.border} ${theme.lightBg} ${theme.text}
          hover:bg-gray-50 transition-colors duration-200
          min-w-[110px]
        `}
      >
        <span>{currentOption.label}</span>
        <svg 
          className={`w-3 h-3 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 w-full z-20"
            >
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-3 py-1.5 text-left text-xs
                      hover:bg-gray-50 transition-colors duration-200
                      ${option.color}
                      ${currentStatus === option.value ? 'font-medium' : ''}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const PleaForm = ({ onSubmit, theme }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your plea here..."
        className={`w-full p-3 rounded-lg border ${theme.border} ${theme.lightBg} 
          focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
          resize-none h-24`}
      />
      <button
        type="submit"
        disabled={!content.trim()}
        className={`mt-2 ${theme.primary} text-white px-4 py-2 rounded-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 ease-in-out`}
      >
        Submit Plea 🙏
      </button>
    </form>
  );
};

export const EscalationControls = ({ 
  complaint, 
  onEscalate, 
  onCreatePlea, 
  onResolvePlea,
  theme 
}) => {
  const { isVishu, isSabaa } = useUser();
  const [showPleaForm, setShowPleaForm] = useState(false);

  const handleEscalate = (status) => {
    if (status !== complaint.status) {
      onEscalate(complaint.id, status);
    }
  };

  const handlePleaSubmit = (content) => {
    onCreatePlea(complaint.id, content);
    setShowPleaForm(false);
  };

  const handleResolvePlea = (pleaId, accepted) => {
    onResolvePlea(pleaId, accepted ? 'accepted' : 'rejected');
  };

  const renderEscalationControls = () => {
    if (!isSabaa) return null;

    return (
      <div className="flex items-center gap-2">
        <StatusDropdown 
          currentStatus={complaint.status}
          onChange={handleEscalate}
          theme={theme}
        />
      </div>
    );
  };

  const renderPleaControls = () => {
    if (complaint.status !== 'upheld') return null;

    const latestPlea = complaint.pleas?.[0];
    const isPleaPending = latestPlea?.status === 'pending';

    if (isVishu && !latestPlea) {
      return (
        <div className="mt-4">
          {!showPleaForm ? (
            <button
              onClick={() => setShowPleaForm(true)}
              className={`${theme.secondary} text-white px-4 py-2 rounded-lg`}
            >
              Make a Plea 🙏
            </button>
          ) : (
            <PleaForm onSubmit={handlePleaSubmit} theme={theme} />
          )}
        </div>
      );
    }

    if (isSabaa && isPleaPending && latestPlea) {
      return (
        <div className="mt-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-700 mb-3">{latestPlea.content}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleResolvePlea(latestPlea.id, true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Accept Plea ✅
              </button>
              <button
                onClick={() => handleResolvePlea(latestPlea.id, false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Reject Plea ❌
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mt-4">
      <AnimatePresence>
        {renderEscalationControls()}
        {renderPleaControls()}
      </AnimatePresence>
    </div>
  );
}; 
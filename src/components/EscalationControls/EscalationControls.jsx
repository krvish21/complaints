import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';

const EscalationButton = ({ status, currentStatus, onClick, theme }) => {
  const statusStyles = {
    upheld: `bg-red-500 hover:bg-red-600`,
    resolved: `bg-green-500 hover:bg-green-600`,
    ok: `${theme.secondary} hover:opacity-90`
  };

  const statusIcons = {
    upheld: '⚠️',
    resolved: '✅',
    ok: '👌'
  };

  const isActive = currentStatus === status;

  return (
    <button
      onClick={() => onClick(status)}
      className={`
        ${statusStyles[status]} 
        ${isActive ? 'ring-2 ring-offset-2 ring-gray-500' : ''}
        text-white px-4 py-2 rounded-lg shadow-md 
        transition-all duration-200 ease-in-out
        flex items-center gap-2 text-sm font-medium
      `}
    >
      <span>{statusIcons[status]}</span>
      <span className="capitalize">{status}</span>
    </button>
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

  const renderEscalationButtons = () => {
    if (!isSabaa) return null;

    return (
      <div className="flex gap-2 mt-4">
        <EscalationButton 
          status="upheld" 
          currentStatus={complaint.status}
          onClick={handleEscalate}
          theme={theme}
        />
        <EscalationButton 
          status="resolved" 
          currentStatus={complaint.status}
          onClick={handleEscalate}
          theme={theme}
        />
        <EscalationButton 
          status="ok" 
          currentStatus={complaint.status}
          onClick={handleEscalate}
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
        {renderEscalationButtons()}
        {renderPleaControls()}
      </AnimatePresence>
    </div>
  );
}; 
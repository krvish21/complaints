import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const CompensationPopup = ({ isOpen, onClose, onSubmit, theme }) => {
  const [options, setOptions] = useState(['']);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length > 0) {
      onSubmit(validOptions);
      setOptions(['']);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className={`text-xl font-semibold ${theme.accent} mb-6`}>
              Make it up to Sabaa 🎁
            </h3>
            <p className={`text-sm ${theme.text} mb-4`}>
              Add up to 5 sweet gestures for Sabaa to choose from
            </p>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder="Something sweet..."
                    className={`flex-1 p-2 text-sm border rounded-lg ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text}`}
                  />
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className={`p-2 text-red-500 hover:text-red-700`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {options.length < 5 && (
                <button
                  onClick={handleAddOption}
                  className={`w-full p-2 text-sm ${theme.lightBg} ${theme.text} rounded-lg border ${theme.border} hover:bg-gray-50`}
                >
                  + Add another sweet gesture
                </button>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 ${theme.primary} text-white rounded-lg text-sm shadow-md`}
              >
                Save surprises
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 
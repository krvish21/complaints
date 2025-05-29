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
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className={`text-xl font-semibold ${theme.accent} mb-4`}>
              Add Compensation Options 🎁
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder="Enter a compensation option..."
                    className={`flex-1 p-2 text-sm border rounded-lg ${theme.border} focus:outline-none focus:ring-2 ring-offset-2 ${theme.text} placeholder-gray-400`}
                  />
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleAddOption}
                  className={`text-sm ${theme.accent} hover:underline`}
                >
                  + Add Another Option
                </button>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 ${theme.primary} text-white rounded-lg text-sm shadow-md`}
                  >
                    Submit Compensation
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 
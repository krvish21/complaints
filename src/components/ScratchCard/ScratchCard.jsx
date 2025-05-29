import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScratchCard = ({ isOpen, onClose, options, onReveal, theme }) => {
  const [revealed, setRevealed] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const canvasRef = useRef(null);
  const [scratchPercentage, setScratchPercentage] = useState(0);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw scratch layer
    ctx.fillStyle = theme.secondary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px Arial';
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    ctx.fillText('Scratch here! 🎁', canvas.width / 2, canvas.height / 2);

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let scratchedPixels = 0;
    const totalPixels = canvas.width * canvas.height;

    const calculateScratchPercentage = (imgData) => {
      let transparent = 0;
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] < 128) transparent++;
      }
      return (transparent / (imgData.data.length / 4)) * 100;
    };

    const draw = (e) => {
      if (!isDrawing) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 40;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastX = x;
      lastY = y;

      // Calculate scratch percentage
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const percentage = calculateScratchPercentage(imgData);
      setScratchPercentage(percentage);

      if (percentage > 50 && !revealed) {
        setRevealed(true);
        // Randomly select an option
        const randomOption = options[Math.floor(Math.random() * options.length)];
        setSelectedOption(randomOption);
      }
    };

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);

    return () => {
      canvas.removeEventListener('mousedown', () => {});
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', () => {});
      canvas.removeEventListener('mouseleave', () => {});
    };
  }, [isOpen]);

  const handleSubmit = () => {
    if (selectedOption) {
      onReveal(selectedOption);
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
              Reveal Your Compensation! ✨
            </h3>
            
            <div className="relative aspect-video mb-4">
              <canvas
                ref={canvasRef}
                className="w-full h-full rounded-lg cursor-pointer"
              />
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-white rounded-lg"
                >
                  <div className={`text-xl ${theme.accent} text-center p-4`}>
                    {selectedOption} 🎉
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!revealed}
                className={`px-4 py-2 ${revealed ? theme.primary : 'bg-gray-300'} text-white rounded-lg text-sm shadow-md`}
              >
                Accept Compensation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 
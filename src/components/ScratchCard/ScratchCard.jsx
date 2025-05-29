import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScratchCard = ({ isOpen, onClose, options, onReveal, theme, disabled = false, firstRevealed = false }) => {
  const [revealed, setRevealed] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const canvasRef = useRef(null);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const option = options[0];

  useEffect(() => {
    if (!isOpen || !canvasRef.current || disabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw scratch layer
    ctx.fillStyle = theme.secondary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    ctx.fillText('Scratch!', canvas.width / 2, canvas.height / 2);

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const calculateScratchPercentage = (imgData) => {
      let transparent = 0;
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] < 128) transparent++;
      }
      return (transparent / (imgData.data.length / 4)) * 100;
    };

    const getCoordinates = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches[0].clientX) - rect.left;
      const y = (e.clientY || e.touches[0].clientY) - rect.top;
      return { x, y };
    };

    const startDrawing = (e) => {
      if (!disabled) {
        isDrawing = true;
        const coords = getCoordinates(e);
        lastX = coords.x;
        lastY = coords.y;
      }
    };

    const draw = (e) => {
      if (!isDrawing || disabled) return;
      e.preventDefault(); // Prevent scrolling on mobile while scratching
      
      const coords = getCoordinates(e);
      const x = coords.x;
      const y = coords.y;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 30;
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
        setSelectedOption(option);
      }
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    // Mouse Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch Events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    return () => {
      // Cleanup Mouse Events
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);

      // Cleanup Touch Events
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
    };
  }, [isOpen, disabled, option]);

  const handleSubmit = () => {
    if (selectedOption) {
      onReveal(selectedOption);
    }
  };

  return (
    <div className={`relative aspect-square rounded-lg overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <canvas
        ref={canvasRef}
        className={`w-full h-full rounded-lg ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
      {revealed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white rounded-lg"
        >
          <div className={`text-base ${theme.accent} text-center p-2`}>
            {option} 🎉
          </div>
        </motion.div>
      )}
      {revealed && !disabled && firstRevealed && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSubmit}
          className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 ${theme.primary} text-white rounded-lg text-xs shadow-md`}
        >
          Select!
        </motion.button>
      )}
    </div>
  );
}; 
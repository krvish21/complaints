import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComplaintCard } from '../ComplaintCard/ComplaintCard';

const NoComplaints = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12 px-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-lg"
  >
    <div className="text-4xl mb-4">💝</div>
    <h3 className="text-xl font-bold text-pink-600 mb-2">No Love Notes Yet</h3>
    <p className="text-pink-400">Be the first one to share your heart's whispers!</p>
  </motion.div>
);

const FeedHeader = ({ total }) => (
  <motion.div 
    className="flex items-center justify-between mb-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div>
      <h2 className="text-2xl font-bold text-pink-600">Love Stories</h2>
      <p className="text-sm text-pink-400 mt-1">
        {total} {total === 1 ? 'story' : 'stories'} shared with love
      </p>
    </div>
    <div className="text-3xl">💌</div>
  </motion.div>
);

export const ComplaintFeed = ({ complaints = [], onReply, onReact, currentUser }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-6">
      <FeedHeader total={complaints.length} />
      
      <AnimatePresence mode="wait">
        {complaints.length === 0 ? (
          <NoComplaints />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {complaints.map((complaint, index) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.1
                }}
              >
                <ComplaintCard
                  complaint={complaint}
                  onReply={onReply}
                  onReact={onReact}
                  currentUser={currentUser}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComplaintCard } from '../ComplaintCard/ComplaintCard';

const NoComplaints = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12 px-4 bg-white rounded-lg border border-gray-100 shadow-sm"
  >
    <div className="text-4xl mb-4">🤔</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Complaints Yet</h3>
    <p className="text-gray-500">Be the first one to share what's on your mind!</p>
  </motion.div>
);

const FeedHeader = ({ total }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900">Recent Complaints</h2>
      <p className="text-sm text-gray-500 mt-1">
        {total} {total === 1 ? 'complaint' : 'complaints'} shared
      </p>
    </div>
  </div>
);

export const ComplaintFeed = ({ complaints = [], onReply, onReact }) => {
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
      
      <AnimatePresence>
        {complaints.length === 0 ? (
          <NoComplaints />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
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
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
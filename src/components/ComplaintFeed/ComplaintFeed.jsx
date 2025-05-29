import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComplaintCard } from '../ComplaintCard/ComplaintCard';
import { moodThemes } from '../../lib/themes';
import { useComplaints } from '../../hooks/useComplaints';
import { useUser } from '../../contexts/UserContext';

const NoComplaints = () => {
  const theme = moodThemes['😢'];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center py-12 px-4 ${theme.lightBg} rounded-2xl border ${theme.border} shadow-lg`}
    >
      <div className="text-4xl mb-4">💭</div>
      <h3 className={`text-xl font-bold ${theme.accent} mb-2`}>All quiet here</h3>
      <p className={`${theme.text}`}>Start the conversation...</p>
    </motion.div>
  );
};

const FeedHeader = ({ total }) => {
  const theme = moodThemes['😊'];
  return (
    <motion.div 
      className="flex items-center justify-between mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h2 className={`text-2xl font-bold ${theme.accent}`}>Our Space</h2>
        <p className={`text-sm ${theme.text} mt-1`}>
          {total} {total === 1 ? 'note' : 'notes'} shared
        </p>
      </div>
      <div className="text-3xl">💭</div>
    </motion.div>
  );
};

export const ComplaintFeed = () => {
  const { 
    complaints, 
    addReply, 
    escalateComplaint,
    createPlea,
    resolvePlea,
    addCompensation, 
    revealCompensation 
  } = useComplaints();
  const { user: currentUser } = useUser();

  const handleReply = async (complaintId, content) => {
    return await addReply(complaintId, content);
  };

  const handleEscalate = async (complaintId, status) => {
    return await escalateComplaint(complaintId, status);
  };

  const handleCreatePlea = async (complaintId, content) => {
    return await createPlea(complaintId, content);
  };

  const handleResolvePlea = async (pleaId, status) => {
    return await resolvePlea(pleaId, status);
  };

  const handleAddCompensation = async (replyId, options) => {
    return await addCompensation(replyId, options);
  };

  const handleRevealCompensation = async (compensationId, selectedOption) => {
    return await revealCompensation(compensationId, selectedOption);
  };

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
                  currentUser={currentUser}
                  onReply={handleReply}
                  onEscalate={handleEscalate}
                  onCreatePlea={handleCreatePlea}
                  onResolvePlea={handleResolvePlea}
                  onAddCompensation={handleAddCompensation}
                  onRevealCompensation={handleRevealCompensation}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
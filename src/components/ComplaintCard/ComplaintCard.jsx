import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export const moods = ['😊', '😡', '😢', '🥺', '😂'];

const SeverityBadge = ({ severity }) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity] || colors.low}`}>
      {severity?.toUpperCase()}
    </span>
  );
};

const CategoryBadge = ({ category }) => (
  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
    {category}
  </span>
);

const UserBadge = ({ email, isAuthor }) => (
  <span className={`inline-flex items-center gap-1 text-xs ${isAuthor ? 'text-blue-600' : 'text-gray-500'}`}>
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
    </svg>
    {email}
  </span>
);

const Reply = ({ reply, currentUser }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pl-4 border-l-2 border-gray-200 mb-3"
  >
    <div className="flex items-center gap-2 mb-1">
      <UserBadge email={reply.user.email} isAuthor={reply.user.id === currentUser?.id} />
      <span className="text-xs text-gray-400">
        {format(new Date(reply.created_at), 'MMM d, yyyy • h:mm a')}
      </span>
    </div>
    <p className="text-sm text-gray-700">{reply.content}</p>
  </motion.div>
);

export const ComplaintCard = ({ complaint, onReply, onReact, onDelete, onEdit, currentUser }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editedTitle, setEditedTitle] = useState(complaint.title);
  const [editedDescription, setEditedDescription] = useState(complaint.description);

  const isAuthor = complaint.user.id === currentUser?.id;
  const userReaction = complaint.reactions?.find(r => r.user.id === currentUser?.id)?.reaction;

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(complaint.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (editedTitle.trim() && editedDescription.trim()) {
      onEdit(complaint.id, {
        title: editedTitle,
        description: editedDescription
      });
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-4 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              placeholder="Title"
            />
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              {complaint.mood} {complaint.title}
            </h3>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <UserBadge email={complaint.user.email} isAuthor={isAuthor} />
            <span className="text-xs text-gray-400">
              {format(new Date(complaint.created_at), 'MMM d, yyyy • h:mm a')}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          {complaint.category && <CategoryBadge category={complaint.category} />}
          {complaint.severity && <SeverityBadge severity={complaint.severity} />}
          {isAuthor && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-500"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(complaint.id)}
                className="text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        {isEditing ? (
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Description"
          />
        ) : (
          <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
        )}
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitEdit}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-4 mb-4 pt-4 border-t border-gray-100">
        <div className="relative">
          <select
            className="appearance-none bg-gray-50 hover:bg-gray-100 transition-colors rounded-full px-4 py-2 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={userReaction || ''}
            onChange={(e) => onReact(complaint.id, e.target.value)}
          >
            <option value="">Add reaction...</option>
            {moods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        <div className="flex gap-1">
          {complaint.reactions?.map((r, index) => (
            <span
              key={index}
              title={r.user.email}
              className="text-lg"
            >
              {r.reaction}
            </span>
          ))}
        </div>
        <button
          onClick={() => setIsReplying(!isReplying)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Reply
        </button>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        {complaint.replies?.map((reply) => (
          <Reply key={reply.id} reply={reply} currentUser={currentUser} />
        ))}

        <AnimatePresence>
          {isReplying && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmitReply}
              className="overflow-hidden"
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit Reply
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

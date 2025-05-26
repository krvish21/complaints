import React from 'react';
import { motion } from 'framer-motion';
import { ComplaintForm } from './components/ComplaintForm/ComplaintForm';
import { ComplaintFeed } from './components/ComplaintFeed/ComplaintFeed';
import { useComplaints } from './hooks/useComplaints';
import './App.css';

const Header = () => (
  <motion.header
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border-b border-gray-100 py-6 px-4 mb-8 sticky top-0 z-10 backdrop-blur-sm bg-white/80"
  >
    <div className="max-w-xl mx-auto flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grievance Box 📮</h1>
        <p className="text-sm text-gray-500 mt-1">Share your thoughts and feelings</p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/yourusername/grievance-app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </a>
      </div>
    </div>
  </motion.header>
);

const MainContent = ({ children }) => (
  <motion.main
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="max-w-xl mx-auto px-4 pb-12"
  >
    {children}
  </motion.main>
);

const App = () => {
  const { complaints, addComplaint, updateReply, updateReaction } = useComplaints();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MainContent>
        <ComplaintForm onSubmit={addComplaint} />
        <ComplaintFeed 
          complaints={complaints} 
          onReply={updateReply} 
          onReact={updateReaction} 
        />
      </MainContent>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Made with ❤️ for expressing feelings</p>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import { motion } from 'framer-motion';
import { ComplaintForm } from './components/ComplaintForm/ComplaintForm';
import { ComplaintFeed } from './components/ComplaintFeed/ComplaintFeed';
import { useComplaints } from './hooks/useComplaints';
import { useUser } from './contexts/UserContext';
import './App.css';

const Header = () => {
  const { user, setUser, USERS } = useUser();

  const handleUserChange = (userType) => {
    console.log('Switching to user:', userType, USERS[userType]);
    setUser(userType);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-100 py-6 px-4 mb-8 sticky top-0 z-10 backdrop-blur-sm bg-white/80"
    >
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Love Notes 💌</h1>
            <p className="text-sm text-gray-500 mt-1">A safe space for us</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-pink-500 h-4 w-4"
              checked={user.id === USERS.SABAA.id}
              onChange={() => handleUserChange('SABAA')}
            />
            <span className="ml-2 text-gray-700">Sabaa</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-pink-500 h-4 w-4"
              checked={user.id === USERS.VISHU.id}
              onChange={() => handleUserChange('VISHU')}
            />
            <span className="ml-2 text-gray-700">Vishu</span>
          </label>
          <span className="text-sm text-gray-500">
            Acting as: <span className="font-medium text-gray-700">{user.name} (ID: {user.id})</span>
          </span>
        </div>
      </div>
    </motion.header>
  );
};

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
  const { user } = useUser();
  const {
    complaints,
    addComplaint,
    addReply,
    updateReaction,
    addCompensation,
    revealCompensation
  } = useComplaints();

  console.log('App render - current user:', user);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MainContent>
        <ComplaintForm onSubmit={addComplaint} />
        <ComplaintFeed 
          complaints={complaints} 
          onReply={addReply} 
          onReact={updateReaction}
          onAddCompensation={addCompensation}
          onRevealCompensation={revealCompensation}
          currentUser={user}
        />
      </MainContent>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Made with love, for love 💕</p>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import { motion } from 'framer-motion';
import { ComplaintForm } from './components/ComplaintForm/ComplaintForm';
import { ComplaintFeed } from './components/ComplaintFeed/ComplaintFeed';
import { useComplaints } from './hooks/useComplaints';
import { useUser } from './contexts/UserContext';
import './App.css';

const Header = () => {
  const { user, setUser, isVishu, isSabaa } = useUser();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Love Notes 💌</h1>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-pink-600"
                name="user"
                checked={isSabaa}
                onChange={() => setUser('Sabaa')}
              />
              <span className="ml-2">Sabaa</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="user"
                checked={isVishu}
                onChange={() => setUser('Vishu')}
              />
              <span className="ml-2">Vishu</span>
            </label>
          </div>
        </div>
      </div>
    </header>
  );
};

const MainContent = ({ children }) => (
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="space-y-6">{children}</div>
  </main>
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

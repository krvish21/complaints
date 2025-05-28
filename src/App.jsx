import React from 'react';
import { motion } from 'framer-motion';
import { ComplaintForm } from './components/ComplaintForm/ComplaintForm';
import { ComplaintFeed } from './components/ComplaintFeed/ComplaintFeed';
import { AuthForm } from './components/Auth/AuthForm';
import { useComplaints } from './hooks/useComplaints';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const Header = ({ user, onSignOut }) => (
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
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <button
            onClick={onSignOut}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  </motion.header>
);

const EmailConfirmationMessage = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-xl mx-auto p-6 bg-yellow-50 rounded-2xl shadow-lg border border-yellow-100 text-center"
  >
    <h2 className="text-2xl font-bold text-yellow-800 mb-4">📧 Check Your Email</h2>
    <p className="text-yellow-700 mb-4">
      Please check your email and click the confirmation link to activate your account.
      You won't be able to access the app until you confirm your email.
    </p>
    <p className="text-sm text-yellow-600">
      Don't see the email? Check your spam folder or try signing up again.
    </p>
  </motion.div>
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
  const { user, signOut, emailConfirmationRequired } = useAuth();
  const { complaints, addComplaint, updateReply, updateReaction } = useComplaints();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSignOut={handleSignOut} />
      <MainContent>
        {emailConfirmationRequired ? (
          <EmailConfirmationMessage />
        ) : user ? (
          <>
            <ComplaintForm onSubmit={addComplaint} />
            <ComplaintFeed 
              complaints={complaints} 
              onReply={updateReply} 
              onReact={updateReaction}
              currentUser={user}
            />
          </>
        ) : (
          <AuthForm />
        )}
      </MainContent>
      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Made with ❤️ for expressing feelings</p>
      </footer>
    </div>
  );
};

export default App;

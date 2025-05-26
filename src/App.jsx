import React from 'react'
import { ComplaintForm } from './components/ComplaintForm/ComplaintForm';
import { ComplaintFeed } from './components/ComplaintFeed/ComplaintFeed';
import { useComplaints } from './hooks/useComplaints';
import './App.css'

const App = () => {
  const { complaints, addComplaint, updateReply, updateReaction } = useComplaints();

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <ComplaintForm onSubmit={addComplaint} />
      <ComplaintFeed 
        complaints={complaints} 
        onReply={updateReply} 
        onReact={updateReaction} 
      />
    </div>
  );
};

export default App;

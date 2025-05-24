import React, { useState } from 'react'
import { ComplaintForm } from './components/ComplaintForm/ComplaintForm';
import { ComplaintFeed } from './components/ComplaintFeed/ComplaintFeed';
import './App.css'
import { insertComplaint } from '../api/submit-compaint';

const mockComplaints = [
  {
    id: 'c1',
    title: 'You forgot to call me 😢',
    description: "I waited all evening and you didn’t call...",
    mood: '😢',
    timestamp: new Date(Date.now() - 86400000),
    reply: 'I’m so sorry love, I’ll make it up to you 💕',
    reaction: '🥺'
  },
  {
    id: 'c2',
    title: 'Left the toilet seat up again 😡',
    description: 'This is the third time this week! 😤',
    mood: '😡',
    timestamp: new Date(Date.now() - 43200000),
    reply: 'My bad! I’ll fix it next time 😅',
    reaction: '😂'
  },
  {
    id: 'c3',
    title: 'Didn’t notice my new haircut 🥺',
    description: 'I spent hours at the salon and you didn’t even say anything... 🥹',
    mood: '🥺',
    timestamp: new Date(Date.now() - 21600000),
    reply: 'It looks beautiful!! I’m blind without your smile 💘',
    reaction: '😊'
  }
];

const App = () => {
  const [complaints, setComplaints] = useState(mockComplaints);

  const addComplaint = async (newComplaint) => {
    setComplaints([newComplaint, ...complaints]);
    await insertComplaint(complaints);
  };

  const updateReply = (id, reply) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reply } : c))
    );
  };

  const updateReaction = (id, reaction) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reaction } : c))
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <ComplaintForm onSubmit={addComplaint} />
      <ComplaintFeed complaints={complaints} onReply={updateReply} onReact={updateReaction} />
    </div>
  );
};

export default App;

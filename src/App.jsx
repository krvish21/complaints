import React, { useState, useEffect } from 'react'
import { ComplaintForm } from './components/ComplaintForm/ComplaintForm';
import { ComplaintFeed } from './components/ComplaintFeed/ComplaintFeed';
import './App.css'

const App = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch('./api/list-complaints', {
          method: 'GET'
        })
        console.log(res)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch')
        setComplaints(data)
      } catch (error) {
        //console.error(error)
      } 
    }

    fetchComplaints()
  }, [])

  const addComplaint = (newComplaint) => {
    console.log("clicked")
    setComplaints([newComplaint, ...complaints]);
    fetch('./api/submit-complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComplaint),
    })
      .then((res) => res.json())
      .then((data) => console.log('Server response:', data))
      .catch((err) => console.error('API error:', err));

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

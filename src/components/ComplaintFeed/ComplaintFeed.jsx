import React from "react";
import { ComplaintCard } from '../ComplaintCard/ComplaintCard';

export const ComplaintFeed = ({ complaints, onReply, onReact }) => (
  <div>
    {complaints.map((complaint) => (
      <ComplaintCard
        key={complaint.id}
        complaint={complaint}
        onReply={onReply}
        onReact={onReact}
      />
    ))}
  </div>
);
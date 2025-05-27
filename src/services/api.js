const API_ENDPOINTS = {
  LIST_COMPLAINTS: '/api/list-complaints',
  SUBMIT_COMPLAINT: '/api/submit-complaint',
};

export const fetchComplaints = async () => {
  const res = await fetch(API_ENDPOINTS.LIST_COMPLAINTS, {
    method: 'GET'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch');
  return data;
};

export const submitComplaint = async (complaint) => {
  const res = await fetch(API_ENDPOINTS.SUBMIT_COMPLAINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaint),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit');
  return data;
}; 
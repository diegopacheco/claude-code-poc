import React, { useState, useEffect } from 'react';
import { store } from '../store';

export default function GiveFeedback() {
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'team' | 'person'>('person');
  const [targetId, setTargetId] = useState('');
  const [members, setMembers] = useState(store.getTeamMembers());
  const [teams, setTeams] = useState(store.getTeams());
  const [feedbacks, setFeedbacks] = useState(store.getFeedbacks());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setMembers(store.getTeamMembers());
      setTeams(store.getTeams());
      setFeedbacks(store.getFeedbacks());
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content && targetId) {
      let targetName = '';
      if (targetType === 'person') {
        const member = members.find(m => m.id === targetId);
        targetName = member?.name || '';
      } else {
        const team = teams.find(t => t.id === targetId);
        targetName = team?.name || '';
      }
      
      try {
        await store.addFeedback({ 
          content, 
          target_type: targetType, 
          target_id: parseInt(targetId) 
        });
        setContent('');
        setTargetId('');
      } catch (error) {
        console.error('Failed to submit feedback:', error);
      }
    }
  };

  const targets = targetType === 'person' ? members : teams;

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Give Feedback</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="radio"
              value="person"
              checked={targetType === 'person'}
              onChange={(e) => setTargetType(e.target.value as 'person')}
            />
            Person
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="radio"
              value="team"
              checked={targetType === 'team'}
              onChange={(e) => setTargetType(e.target.value as 'team')}
            />
            Team
          </label>
        </div>
        
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Select {targetType}</option>
          {targets.map(target => (
            <option key={target.id} value={target.id}>
              {target.name}
            </option>
          ))}
        </select>
        
        <textarea
          placeholder="Enter your feedback..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
        />
        
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Submit Feedback
        </button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <h3>Recent Feedback</h3>
        {feedbacks.length === 0 ? (
          <p>No feedback submitted yet.</p>
        ) : (
          feedbacks.map(feedback => (
            <div key={feedback.id} style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                To: {feedback.target_type === 'person' 
                  ? members.find(m => m.id === feedback.target_id)?.name 
                  : teams.find(t => t.id === feedback.target_id)?.name
                } ({feedback.target_type})
              </div>
              <div style={{ marginBottom: '5px' }}>{feedback.content}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {new Date(feedback.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { store } from '../store';
import { Feedback } from '../types';

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState(store.getFeedbacks());
  const [members, setMembers] = useState(store.getTeamMembers());
  const [teams, setTeams] = useState(store.getTeams());
  const [filterType, setFilterType] = useState<'all' | 'team' | 'member'>('all');
  const [filterId, setFilterId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setFeedbacks(store.getFeedbacks());
      setMembers(store.getTeamMembers());
      setTeams(store.getTeams());
    });
    return unsubscribe;
  }, []);

  const getFilteredFeedbacks = (): Feedback[] => {
    if (filterType === 'all') return feedbacks;
    if (filterId) {
      return store.getFeedbackByTarget(filterType, filterId);
    }
    return store.getFeedbackByTarget(filterType);
  };

  const filteredFeedbacks = getFilteredFeedbacks();
  const filterTargets = filterType === 'member' ? members : teams;

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>All Feedback</h2>
      
      {/* Filters */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ marginRight: '10px' }}>Filter by:</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as any);
              setFilterId(undefined);
            }}
            style={{ padding: '5px', marginRight: '10px' }}
          >
            <option value="all">All Feedback</option>
            <option value="member">Member</option>
            <option value="team">Team</option>
          </select>
        </div>
        
        {filterType !== 'all' && (
          <div>
            <select
              value={filterId || ''}
              onChange={(e) => setFilterId(e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ padding: '5px' }}
            >
              <option value="">All {filterType === 'member' ? 'members' : 'teams'}</option>
              {filterTargets.map(target => (
                <option key={target.id} value={target.id}>
                  {target.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
          Showing {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Feedback List */}
      {filteredFeedbacks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          color: '#666'
        }}>
          No feedback found{filterType !== 'all' || filterId ? ' for the selected filter' : ''}.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredFeedbacks.map(feedback => (
            <div key={feedback.id} style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '10px'
              }}>
                <div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: feedback.target_type === 'team' ? '#28a745' : '#007bff'
                  }}>
                    {feedback.target_type === 'member' 
                      ? members.find(m => m.id === feedback.target_id)?.name 
                      : teams.find(t => t.id === feedback.target_id)?.name
                    }
                  </span>
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: feedback.target_type === 'team' ? '#28a745' : '#007bff',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {feedback.target_type}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(feedback.created_at).toLocaleString()}
                </div>
              </div>
              
              <div style={{ 
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontStyle: 'italic',
                lineHeight: '1.5'
              }}>
                "{feedback.content}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
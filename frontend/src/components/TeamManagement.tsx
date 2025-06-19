import React, { useState, useEffect } from 'react';
import { store } from '../store';
import { Team, TeamMember } from '../types';

export default function TeamManagement() {
  const [teams, setTeams] = useState(store.getTeams());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTeams(store.getTeams());
    });
    return unsubscribe;
  }, []);

  const handleRemoveMember = async (teamId: number, memberId: number) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        await store.removeFromTeam(teamId, memberId);
      } catch (error) {
        console.error('Failed to remove member from team:', error);
      }
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (window.confirm('Are you sure you want to delete this team? This will remove all member assignments.')) {
      try {
        await store.deleteTeam(teamId);
      } catch (error) {
        console.error('Failed to delete team:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px' }}>
      <h2>Team Management</h2>
      
      {teams.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          color: '#666'
        }}>
          No teams created yet. Create a team first to manage it here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {teams.map(team => (
            <div key={team.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {/* Team Header */}
              <div style={{ 
                padding: '20px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img 
                    src={team.logo} 
                    alt={`${team.name} logo`}
                    style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjNjc4M2E2Ii8+Cjx0ZXh0IHg9IjI1IiB5PSIyOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVhbTwvdGV4dD4KPHN2Zz4K';
                    }}
                  />
                  <div>
                    <h3 style={{ margin: '0', fontSize: '24px' }}>{team.name}</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#c82333';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#dc3545';
                  }}
                >
                  Delete Team
                </button>
              </div>

              {/* Team Members */}
              <div style={{ padding: '20px' }}>
                {team.members.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    No members assigned to this team yet.
                  </div>
                ) : (
                  <div>
                    <h4 style={{ marginBottom: '15px', color: '#333' }}>Team Members:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {team.members.map(member => (
                        <div key={member.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '4px',
                          border: '1px solid #eee'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img 
                              src={member.picture} 
                              alt={member.name}
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2Yzc1N2QiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeD0iOCIgeT0iOCI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCA4IDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMFYyMUgxOFYyMEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPHN2Zz4K';
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{member.name}</div>
                              <div style={{ color: '#666', fontSize: '14px' }}>{member.email}</div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveMember(team.id, member.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ffc107',
                              color: '#212529',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            onMouseOver={(e) => {
                              (e.target as HTMLElement).style.backgroundColor = '#e0a800';
                            }}
                            onMouseOut={(e) => {
                              (e.target as HTMLElement).style.backgroundColor = '#ffc107';
                            }}
                          >
                            Remove from Team
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
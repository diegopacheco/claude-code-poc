import React, { useState, useEffect } from 'react';
import { store } from '../store';

export default function AssignToTeam() {
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [members, setMembers] = useState(store.getUnassignedMembers());
  const [teams, setTeams] = useState(store.getTeams());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setMembers(store.getUnassignedMembers());
      setTeams(store.getTeams());
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember && selectedTeam) {
      try {
        await store.assignMemberToTeam(selectedMember, selectedTeam);
        setSelectedMember('');
        setSelectedTeam('');
      } catch (error) {
        console.error('Failed to assign member to team:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Assign to Team</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Select Member</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Select Team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Assign to Team
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h3>Current Teams</h3>
        {teams.map(team => (
          <div key={team.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h4>{team.name}</h4>
            <div>Members: {team.members.length}</div>
            {team.members.map(member => (
              <div key={member.id} style={{ marginLeft: '10px', fontSize: '14px' }}>
                • {member.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
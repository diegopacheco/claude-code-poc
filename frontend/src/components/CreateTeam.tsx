import React, { useState } from 'react';
import { store } from '../store';

export default function CreateTeam() {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && logo) {
      store.addTeam({ name, logo });
      setName('');
      setLogo('');
      alert('Team created successfully!');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Create Team</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Team Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="url"
          placeholder="Team Logo URL"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Team
        </button>
      </form>
    </div>
  );
}
import React, { useState } from 'react';
import AddTeamMember from './components/AddTeamMember';
import CreateTeam from './components/CreateTeam';
import AssignToTeam from './components/AssignToTeam';
import GiveFeedback from './components/GiveFeedback';

type Page = 'add-member' | 'create-team' | 'assign-team' | 'give-feedback';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('add-member');

  const pages = {
    'add-member': { title: 'Add Team Member', component: <AddTeamMember /> },
    'create-team': { title: 'Create Team', component: <CreateTeam /> },
    'assign-team': { title: 'Assign to Team', component: <AssignToTeam /> },
    'give-feedback': { title: 'Give Feedback', component: <GiveFeedback /> },
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ 
        backgroundColor: '#343a40', 
        padding: '1rem', 
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <h1 style={{ color: 'white', margin: '0 20px 0 0', fontSize: '24px' }}>Coaching App</h1>
        {Object.entries(pages).map(([key, page]) => (
          <button
            key={key}
            onClick={() => setCurrentPage(key as Page)}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === key ? '#007bff' : 'transparent',
              color: 'white',
              border: '1px solid #007bff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {page.title}
          </button>
        ))}
      </nav>
      
      <main>
        {pages[currentPage].component}
      </main>
    </div>
  );
}
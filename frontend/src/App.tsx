import React, { useState, useEffect } from 'react';
import AddTeamMember from './components/AddTeamMember';
import CreateTeam from './components/CreateTeam';
import AssignToTeam from './components/AssignToTeam';
import GiveFeedback from './components/GiveFeedback';
import FeedbackList from './components/FeedbackList';
import TeamManagement from './components/TeamManagement';
import { Toast } from './components/Toast';
import { store } from './store';

type Page = 'add-member' | 'create-team' | 'assign-team' | 'give-feedback' | 'feedback-list' | 'team-management';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('add-member');
  const [toastState, setToastState] = useState(store.getToastState());

  useEffect(() => {
    // Initialize data from API
    store.initializeData();

    // Subscribe to store changes
    const unsubscribe = store.subscribe(() => {
      setToastState(store.getToastState());
    });

    return unsubscribe;
  }, []);

  const pages = {
    'add-member': { title: 'Add Team Member', component: <AddTeamMember /> },
    'create-team': { title: 'Create Team', component: <CreateTeam /> },
    'assign-team': { title: 'Assign to Team', component: <AssignToTeam /> },
    'give-feedback': { title: 'Give Feedback', component: <GiveFeedback /> },
    'feedback-list': { title: 'View Feedback', component: <FeedbackList /> },
    'team-management': { title: 'Manage Teams', component: <TeamManagement /> },
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ 
        backgroundColor: '#343a40', 
        padding: '1rem', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo-app.png" 
            alt="Coaching App Logo" 
            style={{ width: '40px', height: '40px' }}
          />
          <h1 style={{ color: 'white', margin: '0', fontSize: '24px' }}>Coaching App</h1>
        </div>
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

      <Toast 
        message={toastState.message}
        show={toastState.show}
        onClose={() => store.hideToast()}
      />
    </div>
  );
}
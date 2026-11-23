import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ApplicationForm from './components/ApplicationForm.jsx';
import PipelineBoard from './components/PipelineBoard.jsx';
import AccountPage from './components/AccountPage.jsx';
import helper from './helper.js';

// top level component, owns the application list and account info
const App = () => {
    const [view, setView] = useState('board');
    const [applications, setApplications] = useState([]);
    const [account, setAccount] = useState(null);

    const loadApplications = async () => {
        const response = await fetch('/getApplications');
        const data = await response.json();
        setApplications(data.applications || []);
    };

    const loadAccount = async () => {
        const response = await fetch('/getAccountInfo');
        setAccount(await response.json());
    };

    // save edits, onDone closes the edit mode on the card
    const saveApplication = (changes, onDone) => {
        helper.hideError();
        helper.sendPost('/updateApplication', changes, (result) => {
            if(!result.error) {
                loadApplications();
                onDone();
            }
        });
    };

    // ask first, then remove the card and reload
    const deleteApplication = (id) => {
        if(!window.confirm('Delete this application?')) {
            return;
        }
        helper.hideError();
        helper.sendPost('/deleteApplication', {id}, (result) => {
            if(!result.error) {
                loadApplications();
            }
        });
    };

    const togglePremium = () => {
        helper.hideError();
        helper.sendPost('/togglePremium', {}, (result) => {
            if(!result.error) {
                loadAccount();
            }
        });
    };

    useEffect(() => {
        loadApplications();
        loadAccount();
    }, []);

    // rejected cards do not count toward the free cap
    const activeCount = applications.filter((app) => app.status !== 'Rejected').length;

    let usage = '';
    if(account) {
        usage = account.isPremium
            ? `${activeCount} active, premium`
            : `${activeCount} / ${account.activeLimit} active`;
    }

    return (
        <div id="trackerRoot">
            <div className="tabs">
                <button className={view === 'board' ? 'tab active' : 'tab'}
                    onClick={() => setView('board')}>Board</button>
                <button className={view === 'account' ? 'tab active' : 'tab'}
                    onClick={() => setView('account')}>Account</button>
                <span className="usage">{usage}</span>
            </div>

            {view === 'board' ? (
                <div>
                    <ApplicationForm onAdded={loadApplications} />
                    <PipelineBoard
                        applications={applications}
                        onSave={saveApplication}
                        onDelete={deleteApplication}
                    />
                </div>
            ) : (
                <AccountPage account={account} activeCount={activeCount} onTogglePremium={togglePremium} />
            )}
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App /> );
};

window.onload = init;

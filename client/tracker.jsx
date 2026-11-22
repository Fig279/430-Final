import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ApplicationForm from './components/ApplicationForm.jsx';
import PipelineBoard from './components/PipelineBoard.jsx';
import helper from './helper.js';

// top level component, owns the application list
const App = () => {
    const [applications, setApplications] = useState([]);

    const loadApplications = async () => {
        const response = await fetch('/getApplications');
        const data = await response.json();
        setApplications(data.applications || []);
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

    useEffect(() => {
        loadApplications();
    }, []);

    return (
        <div id="trackerRoot">
            <ApplicationForm onAdded={loadApplications} />
            <PipelineBoard applications={applications} onDelete={deleteApplication} />
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App /> );
};

window.onload = init;

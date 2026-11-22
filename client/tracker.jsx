import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ApplicationForm from './components/ApplicationForm.jsx';
import PipelineBoard from './components/PipelineBoard.jsx';

// top level component, owns the application list
const App = () => {
    const [applications, setApplications] = useState([]);

    const loadApplications = async () => {
        const response = await fetch('/getApplications');
        const data = await response.json();
        setApplications(data.applications || []);
    };

    useEffect(() => {
        loadApplications();
    }, []);

    return (
        <div id="trackerRoot">
            <ApplicationForm onAdded={loadApplications} />
            <PipelineBoard applications={applications} />
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App /> );
};

window.onload = init;

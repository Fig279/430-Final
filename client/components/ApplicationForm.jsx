import React, { useState } from 'react';
import helper from '../helper.js';
import { STATUSES } from '../statuses.js';

// form for adding an application, onAdded runs after the server accepts it
const ApplicationForm = (props) => {
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('Wishlist');

    const handleSubmit = (e) => {
        e.preventDefault();
        helper.hideError();

        if(!company || !role) {
            helper.handleError('Company and role are required!');
            return false;
        }

        helper.sendPost('/tracker', {company, role, status}, (result) => {
            if(!result.error) {
                setCompany('');
                setRole('');
                props.onAdded();
            }
        });
        return false;
    };

    return (
        <form id="applicationForm"
            onSubmit={handleSubmit}
            name="applicationForm"
            action="/tracker"
            method="POST"
            className="applicationForm"
        >
            <input type="text" placeholder="Company" value={company}
                onChange={(e) => setCompany(e.target.value)} />
            <input type="text" placeholder="Role" value={role}
                onChange={(e) => setRole(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className="formSubmit" type="submit" value="Add application" />
        </form>
    );
};

export default ApplicationForm;

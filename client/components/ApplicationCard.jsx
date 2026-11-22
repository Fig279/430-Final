import React, { useState } from 'react';
import { STATUSES } from '../statuses.js';

// one application, view mode with edit and delete, edit mode with a save form
const ApplicationCard = (props) => {
    const application = props.application;
    const [editing, setEditing] = useState(false);
    const [company, setCompany] = useState(application.company);
    const [role, setRole] = useState(application.role);
    const [status, setStatus] = useState(application.status);
    const [notes, setNotes] = useState(application.notes);

    // reset the drafts to the saved values before editing
    const startEditing = () => {
        setCompany(application.company);
        setRole(application.role);
        setStatus(application.status);
        setNotes(application.notes);
        setEditing(true);
    };

    const save = () => {
        props.onSave({id: application._id, company, role, status, notes}, () => setEditing(false));
    };

    if(editing) {
        return (
            <div className="applicationCard editing">
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} />
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <textarea value={notes} placeholder="Notes" rows="3"
                    onChange={(e) => setNotes(e.target.value)} />
                <div className="cardActions">
                    <button className="cardButton save" onClick={save}>Save</button>
                    <button className="cardButton" onClick={() => setEditing(false)}>Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className="applicationCard">
            <h4 className="cardCompany">{application.company}</h4>
            <p className="cardRole">{application.role}</p>
            {application.notes && <p className="cardNotes">{application.notes}</p>}
            <div className="cardActions">
                <button className="cardButton" onClick={startEditing}>Edit</button>
                <button className="cardButton danger" onClick={() => props.onDelete(application._id)}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ApplicationCard;

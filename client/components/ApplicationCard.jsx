import React from 'react';

// one application, shows company and role with a delete button
const ApplicationCard = (props) => {
    const application = props.application;

    return (
        <div className="applicationCard">
            <h4 className="cardCompany">{application.company}</h4>
            <p className="cardRole">{application.role}</p>
            <button className="cardDelete" onClick={() => props.onDelete(application._id)}>
                Delete
            </button>
        </div>
    );
};

export default ApplicationCard;

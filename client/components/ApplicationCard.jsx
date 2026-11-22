import React from 'react';

// one application, shows company and role
const ApplicationCard = (props) => {
    const application = props.application;

    return (
        <div className="applicationCard">
            <h4 className="cardCompany">{application.company}</h4>
            <p className="cardRole">{application.role}</p>
        </div>
    );
};

export default ApplicationCard;

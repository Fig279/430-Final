import React from 'react';
import ApplicationCard from './ApplicationCard.jsx';
import { STATUSES } from '../statuses.js';

// one column per status, cards are grouped by their status
const PipelineBoard = (props) => {
    const columns = STATUSES.map((status) => {
        const cards = props.applications.filter((app) => app.status === status);

        return (
            <div className="boardColumn" key={status}>
                <h3 className="columnHeader">
                    {status} <span className="columnCount">{cards.length}</span>
                </h3>
                {cards.length === 0 && <p className="columnEmpty">Nothing here yet</p>}
                {cards.map((app) => (
                    <ApplicationCard
                        key={app._id}
                        application={app}
                        onSave={props.onSave}
                        onDelete={props.onDelete}
                    />
                ))}
            </div>
        );
    });

    return (
        <div className="pipelineBoard">
            {columns}
        </div>
    );
};

export default PipelineBoard;

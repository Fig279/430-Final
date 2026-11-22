const React = require('react');
const { createRoot } = require('react-dom/client');

// top level component, board components get added here
const App = () => {
    return (
        <div id="trackerRoot">
            <h2>Your pipeline</h2>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render( <App /> );
};

window.onload = init;

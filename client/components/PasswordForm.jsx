import React, { useState } from 'react';
import helper from '../helper.js';

// change password form, needs the current password
const PasswordForm = () => {
    const [pass, setPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newPass2, setNewPass2] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        helper.hideError();
        setMessage('');

        if(!pass || !newPass || !newPass2) {
            helper.handleError('All fields are required!');
            return false;
        }

        helper.sendPost('/changePassword', {pass, newPass, newPass2}, (result) => {
            if(!result.error) {
                setPass('');
                setNewPass('');
                setNewPass2('');
                setMessage(result.message);
            }
        });
        return false;
    };

    return (
        <form id="passwordForm" onSubmit={handleSubmit} className="accountForm">
            <h3>Change password</h3>
            <input type="password" placeholder="Current password" value={pass}
                onChange={(e) => setPass(e.target.value)} />
            <input type="password" placeholder="New password" value={newPass}
                onChange={(e) => setNewPass(e.target.value)} />
            <input type="password" placeholder="Confirm new password" value={newPass2}
                onChange={(e) => setNewPass2(e.target.value)} />
            <input className="formSubmit" type="submit" value="Change password" />
            {message && <p className="successMessage">{message}</p>}
        </form>
    );
};

export default PasswordForm;

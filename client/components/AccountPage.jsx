import React from 'react';
import PasswordForm from './PasswordForm.jsx';

// account view with plan info, demo premium toggle and password change
const AccountPage = (props) => {
    const account = props.account;

    if(!account) {
        return <p>Loading account...</p>;
    }

    return (
        <div className="accountPage">
            <h2>{account.username}</h2>

            <div className="planCard">
                <h3>{account.isPremium ? 'Premium plan' : 'Free plan'}</h3>
                {account.isPremium ? (
                    <p>Unlimited active applications. You have {props.activeCount} right now.</p>
                ) : (
                    <p>
                        {props.activeCount} of {account.activeLimit} active applications used.
                        Rejected applications do not count.
                    </p>
                )}
                <button className="formSubmit" onClick={props.onTogglePremium}>
                    {account.isPremium ? 'Switch to free' : 'Upgrade to premium'}
                </button>
                <p className="planNote">Demo only, no payment information is collected</p>
            </div>

            <PasswordForm />
        </div>
    );
};

export default AccountPage;

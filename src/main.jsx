import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL before rendering
msalInstance.initialize().then(() => {
    // Default to the first account if one is already logged in
    if (msalInstance.getAllAccounts().length > 0) {
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    }

    // Listen for login events and set active account
    msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
            msalInstance.setActiveAccount(event.payload.account);
        }
    });

    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        </React.StrictMode>,
    );
}).catch(e => {
    console.error("MSAL Initialization Error:", e);
});

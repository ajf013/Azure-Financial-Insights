export const msalConfig = {
  auth: {
    clientId: "865b5a2e-e9cc-4e33-8425-5de5599245f3", // Application (client) ID
    authority: "https://login.microsoftonline.com/9cd6adc7-311b-4430-a9e1-42f8c0579762", // MCT Developer Software & Services
    redirectUri: window.location.origin, // Dynamic URI for local and live environments
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage", // More persistent than sessionStorage
    storeAuthStateInCookie: true,  // Helps with IE/Edge and certain Safari versions
  },
};

// Scopes for Azure Management API
export const loginRequest = {
  scopes: [
    "https://management.azure.com/user_impersonation",
    "User.Read"
  ],
};

# Documentation for `auth.js`

## Overview

This file handles backend API interaction logic for the React app. Below is a breakdown of how the functions in `auth.js` work.

## Code Preview

```
// src/api/auth.js

export async function getValidToken() {
  const accessToken = localStorage.getItem("user_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const expiry = Number(localStorage.getItem("token_expiry"));

  // Use valid access token
  if (accessToken && expiry && Date.now() < expiry) {
    return accessToken;
  }

  // No refresh token → force login
  if (!refreshToken) {
    redirectToLogin();
    return null;
  }

  try {
    const res = await fetch("/api
... (code truncated for preview)
```

## Detailed Explanation

- **Imports**: Modules or libraries imported.
- **API functions**: Each exported function, what endpoint it calls, what data it sends/receives.
- **Error handling**: How errors are managed or logged.
- **Exports**: What functions are made available to the app.

> 📘 This is part of the student guide to help understand how API calls work in React apps.

# Documentation for `user.js`

## Overview

This file handles backend API interaction logic for the React app. Below is a breakdown of how the functions in `user.js` work.

## Code Preview

```
// src/api/user.js
import { getValidToken } from "./auth";

// 🔒 Helper to catch revoked token errors
function handleRevokedToken(errText, status) {
  if (status === 401 && errText.includes("Token revoked")) {
    console.warn("🚫 Token revoked");
    localStorage.clear();
    window.location.href = "/";
  }
}

// Request login pincode
export async function requestPincode(email, password) {
  const res = await fetch("/api/user_login", {
    method: "POST",
    headers: { "Content-Type": "applicat
... (code truncated for preview)
```

## Detailed Explanation

- **Imports**: Modules or libraries imported.
- **API functions**: Each exported function, what endpoint it calls, what data it sends/receives.
- **Error handling**: How errors are managed or logged.
- **Exports**: What functions are made available to the app.

> 📘 This is part of the student guide to help understand how API calls work in React apps.

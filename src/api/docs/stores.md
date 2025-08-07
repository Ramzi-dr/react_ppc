# Documentation for `stores.js`

## Overview

This file handles backend API interaction logic for the React app. Below is a breakdown of how the functions in `stores.js` work.

## Code Preview

```
// src/api/stores.js
import { getValidToken } from "./auth";

// Fetch stores linked to current user
export async function fetchUserStores() {
  const token = await getValidToken();
  const currentEmail = localStorage.getItem("user_email");

  if (!token || !currentEmail) {
    console.warn("[fetchUserStores] Missing token or user_email");
    throw {
      message: "❌ Missing authentication. Please login again.",
      type: "error",
    };
  }

  try {
    const res = await fetch("/api/stores/
... (code truncated for preview)
```

## Detailed Explanation

- **Imports**: Modules or libraries imported.
- **API functions**: Each exported function, what endpoint it calls, what data it sends/receives.
- **Error handling**: How errors are managed or logged.
- **Exports**: What functions are made available to the app.

> 📘 This is part of the student guide to help understand how API calls work in React apps.

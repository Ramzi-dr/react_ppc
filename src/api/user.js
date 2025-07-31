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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[user.js] Login failed:", text);
    throw new Error(`HTTP ${res.status} - ${text}`);
  }

  const data = await res.json();
  console.log("[user.js] Login response:", data);
  return data;
}

// Verify pincode to receive tokens
export async function verifyPincode(email, pincode) {
  console.log("[user.js] Verifying pincode for email:", email);

  const res = await fetch("/api/verify_pincode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, pincode }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[user.js] Pincode verification failed:", text);
    throw new Error(`HTTP ${res.status} - ${text}`);
  }

  const data = await res.json();
  console.log("[user.js] Pincode verification success:", data);

  // Save to localStorage
  localStorage.setItem("user_email", email);
  localStorage.setItem("user_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);

  return data;
}

// Update user profile (password, email)
export async function updateUser(updateData) {
  const email = localStorage.getItem("user_email");
  if (!email) throw new Error("Missing email");

  const token = await getValidToken();

  const res = await fetch("/api/users", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...updateData, email }),
  });

  const text = await res.text();
  if (!res.ok) {
    handleRevokedToken(text, res.status);
    console.error("[user.js] Update failed:", text);
    throw new Error(`HTTP ${res.status} - ${text}`);
  }

  return JSON.parse(text);
}

// Delete user account
export async function deleteUser() {
  const email = localStorage.getItem("user_email");
  if (!email) throw new Error("Missing email");

  const token = await getValidToken();

  const res = await fetch("/api/users", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, force: true }),
  });

  const text = await res.text();
  if (!res.ok) {
    handleRevokedToken(text, res.status);
    console.error("[user.js] Delete failed:", text);
    throw new Error(`HTTP ${res.status} - ${text}`);
  }

  return JSON.parse(text);
}

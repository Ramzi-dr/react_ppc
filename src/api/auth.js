// src/api/auth.js

export async function getValidToken() {
  const accessToken = localStorage.getItem("user_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const expiry = Number(localStorage.getItem("token_expiry"));

  // If token still valid, use it
  if (accessToken && expiry && Date.now() < expiry) {
    return accessToken;
  }

  // If no refresh token, redirect
  if (!refreshToken) {
    redirectToLogin();
    return null;
  }

  try {
    const res = await fetch("/api/token/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh token invalid");

    const data = await res.json();
    const now = Date.now();
    const expires = now + data.access_expires_in * 1000;

    localStorage.setItem("user_token", data.access_token);
    localStorage.setItem("token_expiry", expires.toString());

    return data.access_token;
  } catch {
    redirectToLogin();
    return null;
  }
}

function redirectToLogin() {
  localStorage.clear();
  const path = window.location.pathname;
  if (path !== "/" && path !== "/login") {
    window.location.href = "/";
  }
}

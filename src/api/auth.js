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
    const res = await fetch("/api/token/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 401 && text.includes("Token revoked")) {
        console.warn("🔒 Token revoked");
        redirectToLogin();
        return null;
      }
      throw new Error("Refresh failed");
    }

    const data = await res.json();
    const now = Date.now();
    const expires = now + data.access_expires_in * 1000;

    localStorage.setItem("user_token", data.access_token);
    localStorage.setItem("token_expiry", expires.toString());

    return data.access_token;
  } catch (err) {
    console.error("Refresh token error:", err);
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

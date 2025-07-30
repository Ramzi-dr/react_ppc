// src/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getValidToken } from "./api/auth";

export default function ProtectedRoute({ children }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const checkToken = async () => {
      const token = await getValidToken();
      if (!cancelled) {
        setAuthorized(!!token);
      }
    };

    checkToken();
    return () => {
      cancelled = true;
    };
  }, []);

  if (authorized === null) {
    return <div className="text-center mt-5">🔐 Checking access...</div>;
  }

  if (!authorized) {
    return <Navigate to="/" />;
  }

  return children;
}

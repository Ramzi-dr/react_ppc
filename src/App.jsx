import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./Home";
import Login from "./Login";
import Settings from "./Settings";

export default function App() {

  return (
    <div className="app-wrapper">
      <Routes>
        <Route
          path="/"
          element={
            <>
              {console.log("APP: Rendering / (Login) route")}
              <Login />
            </>
          }
        />
        <Route
          path="/home"
          element={
            <>
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </>
          }
        />
      </Routes>
    </div>
  );
}

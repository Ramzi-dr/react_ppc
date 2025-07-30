// src/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPincode, verifyPincode } from "./api/user";
import { getValidToken } from "./api/auth";
import Popup from "./Popup";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Footer from "./components/Footer";
import "./css/Login.css";
import "./css/Popup.css";
import "./css/Button.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pincode, setPincode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [step, setStep] = useState("login");

  useEffect(() => {
    getValidToken().then((token) => {
      if (token) navigate("/home");
    });
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      setPopup({ type: "error", message: "❌ Invalid email format." });
      return;
    }
    if (!password.trim()) {
      setPopup({ type: "error", message: "❌ Password cannot be empty." });
      return;
    }

    setLoading(true);
    try {
      await requestPincode(email, password);
      setStep("verify");
      setPopup({
        type: "info",
        message: "✅ Pincode sent to your email. Please check.",
      });
    } catch (err) {
      let msg = "❌ Unknown error.";
      if (err.message.includes("401")) msg = "❌ Invalid credentials.";
      else if (err.message.includes("404")) msg = "❌ User not found.";
      else if (err.message.includes("400")) msg = "❌ Missing fields.";
      setPopup({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (pincode.length !== 6) {
      setPopup({ type: "error", message: "❌ Enter a 6-digit pincode." });
      return;
    }

    setLoading(true);
    try {
      const data = await verifyPincode(email, pincode);
      const now = Date.now();
      const expires = now + data.access_expires_in * 1000;

      localStorage.setItem("user_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_expiry", expires.toString());
      localStorage.setItem("user_email", email);

      navigate("/home");
    } catch {
      setPopup({ type: "error", message: "❌ Invalid or expired pincode." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">PeopleCounting</h2>

        {popup && (
          <Popup
            message={popup.message}
            type={popup.type}
            onClose={() => setPopup(null)}
          />
        )}

        {step === "login" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="login-field">
              <label>Email:</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label>Password:</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>

            <button className="btn btn-primary login-button" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Login"}
            </button>

            <div className="forgot-password">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPopup({
                    type: "info",
                    message: (
                      <>
                        🔐 For help, contact support.
                        <br />
                        <button
                          className="btn btn-primary btn-sm mt-2"
                          onClick={() => {
                            window.open("https://www.homesecurity.ch/kontakt", "_blank");
                            setPopup(null);
                          }}
                        >
                          Contact Support
                        </button>
                      </>
                    ),
                  });
                }}
              >
                Forgot password?
              </a>
            </div>
          </form>
        )}

        {step === "verify" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <div className="login-field">
              <label>Enter 6-digit Pincode:</label>
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                disabled={loading}
              />
            </div>

            <button className="btn btn-primary login-button" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </form>
        )}

<div className="footer-wrapper">
        <Footer />
      </div>


      </div>
    </div>
  );
}

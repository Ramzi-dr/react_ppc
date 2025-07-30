import { useState } from "react";
import FloatingMenu from "./FloatingMenu";
import Popup from "./Popup";
import Loading from "./Loading";
import "./css/Settings.css";
import Footer from "./components/Footer";

export default function Settings() {
  const [popup, setPopup] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [email, setEmail] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [emailChange, setEmailChange] = useState("");

  const validatePassword = (pw) => ({
    length: pw.length >= 6,
    number: /\d/.test(pw),
    upper: /[A-Z]/.test(pw),
  });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordStatus = validatePassword(newPass);

  const resetAllFields = () => {
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setEmail("");
    setEmailChange("");
    setConfirmPhrase("");
  };

  const handleConfirm = () => {
    const action = confirmPopup?.action;
    setConfirmPopup(null);
    if (action === "password") submitPasswordUpdate();
    if (action === "delete") submitDelete();
    if (action === "email") submitChangeEmail();
    resetAllFields();
  };

  const handlePasswordUpdate = () => {
    if (newPass !== confirmPass) {
      setPopup({ type: "error", message: "❌ Passwords do not match." });
      return;
    }
    if (
      !passwordStatus.length ||
      !passwordStatus.number ||
      !passwordStatus.upper
    ) {
      setPopup({ type: "error", message: "❌ Password is not strong enough." });
      return;
    }
    setConfirmPopup({ action: "password", message: "Change password?" });
  };

  const submitPasswordUpdate = async () => {
    const token = localStorage.getItem("user_token");
    const email = localStorage.getItem("user_email");
    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          password: newPass,
          old_password: oldPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setPopup({
        type: "info",
        message: "✅ Password updated. Logging out...",
      });
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/";
      }, 3000);
    } catch (e) {
      setPopup({ type: "error", message: "❌ " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    const userEmail = localStorage.getItem("user_email")?.toLowerCase().trim();
    const enteredEmail = email.toLowerCase().trim();

    if (confirmPhrase.toLowerCase() !== "delete") {
      setPopup({
        type: "error",
        message: "❌ You must type 'delete' to confirm.",
      });
      return;
    }

    if (!isValidEmail(enteredEmail) || enteredEmail !== userEmail) {
      setPopup({
        type: "error",
        message: "❌ Email must match your logged-in account.",
      });
      setEmail("");
      return;
    }

    setConfirmPopup({
      action: "delete",
      message: "Delete account permanently?",
    });
  };

  const submitDelete = async () => {
    const token = localStorage.getItem("user_token");
    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, force: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setPopup({ type: "info", message: "✅ Account deleted. Logging out..." });
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/";
      }, 3000);
    } catch (e) {
      setPopup({ type: "error", message: "❌ " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    if (!isValidEmail(emailChange)) {
      setPopup({ type: "error", message: "❌ Invalid email format." });
      setEmailChange("");
      return;
    }
    setConfirmPopup({ action: "email", message: "Change email address?" });
  };

  const submitChangeEmail = async () => {
    const token = localStorage.getItem("user_token");
    const currentEmail = localStorage.getItem("user_email");
    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentEmail, new_email: emailChange }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setPopup({ type: "info", message: "✅ Email updated. Logging out..." });
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/";
      }, 3000);
    } catch (e) {
      setPopup({ type: "error", message: "❌ " + e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>

      <div className="settings-buttons">
        {active !== "password" && (
          <button
            className="btn-password"
            onClick={() => setActive("password")}
          >
            Change Password
          </button>
        )}
        {active !== "delete" && (
          <button className="btn-delete" onClick={() => setActive("delete")}>
            Delete Account
          </button>
        )}
        {active !== "email" && (
          <button className="btn-email" onClick={() => setActive("email")}>
            Change Email
          </button>
        )}
      </div>

      {active === "password" && (
        <div className="section-box">
          <div className="password-requirements">
            {/* must be{" "} */}
            <span className={passwordStatus.length ? "valid" : "invalid"}>
              6+ chars
            </span>
            ,
            <span className={passwordStatus.number ? "valid" : "invalid"}>
              {" "}
              1 number
            </span>{" "}
            and
            <span className={passwordStatus.upper ? "valid" : "invalid"}>
              {" "}
              1 uppercase
            </span>
          </div>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <button className="btn-password" onClick={handlePasswordUpdate}>
            Confirm
          </button>
        </div>
      )}

      {active === "delete" && (
        <div className="section-box">
          <input
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Type 'delete' to confirm"
            value={confirmPhrase}
            onChange={(e) => setConfirmPhrase(e.target.value)}
          />
          <button className="btn-delete" onClick={handleDelete}>
            Delete Account
          </button>
        </div>
      )}

      {active === "email" && (
        <div className="section-box">
          <input
            placeholder="New Email"
            value={emailChange}
            onChange={(e) => setEmailChange(e.target.value)}
          />
          <button className="btn-email" onClick={handleChangeEmail}>
            Change Email
          </button>
        </div>
      )}

      {loading && <Loading text="Please wait..." />}

      {popup && (
        <Popup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}

      {confirmPopup && (
        <Popup
          type="info"
          message={
            <div>
              <p style={{ margin: 0 }}>{confirmPopup.message}</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "12px",
                }}
              >
                <button
                  onClick={handleConfirm}
                  style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    padding: "8px 18px",
                    border: "none",
                    borderRadius: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          }
          onClose={() => {
            setConfirmPopup(null);
            resetAllFields();
          }}
        />
      )}
      <FloatingMenu />
      <div className="footer-wrapper">
        <Footer />
      </div>
    </div>
  );
}

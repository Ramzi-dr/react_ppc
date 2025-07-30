//./src/Popup.jsx
import "./css/Popup.css";

export default function Popup({ message, type = "info", onClose }) {
  const typeClass = {
    info: "popup-info",
    warning: "popup-warning",
    error: "popup-error",
  };

  return (
    <div className="popup-overlay">
      <div className={`popup-content ${typeClass[type] || typeClass.info}`}>
        <div className="mb-3">{message}</div>
        <button onClick={onClose} className="btn btn-secondary btn-sm">
          Close
        </button>
      </div>
    </div>
  );
}

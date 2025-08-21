import React, { useState, useRef, useEffect } from "react";
import "../css/FilterPopup.css";

export default function FilterBySingleDay({ storeName, onClose, onSubmit }) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const minDate = new Date(now);
  minDate.setFullYear(now.getFullYear() - 3);
  const minDateStr = minDate.toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const dateRef = useRef(null);
  const popupRef = useRef(null);

  const handleSubmit = () => {
    if (!date) {
      alert("❌ Please select a valid date.");
      return;
    }

    onSubmit({
      store: storeName,
      date,
    });

    onClose();
  };

  const openPicker = () => {
    if (dateRef.current?.showPicker) {
      dateRef.current.showPicker();
    }
  };

  // ✅ Focus to capture Enter/Escape keys
  useEffect(() => {
    if (popupRef.current) popupRef.current.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="popup-overlay">
      <div
        className="popup-content"
        ref={popupRef}
        tabIndex={0}               // ✅ make focusable
        onKeyDown={handleKeyDown}  // ✅ handle Enter/Escape
      >
        <h2>Filter by Single Day</h2>
        <p>
          <b>Store:</b> {storeName}
        </p>

        <label>Date:</label>
        <div style={{ textAlign: "center" }} onClick={openPicker}>
          <input
            ref={dateRef}
            type="date"
            value={date}
            min={minDateStr}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            style={{ cursor: "pointer", display: "inline-block" }}
          />
        </div>

        <div className="popup-buttons">
          <button onClick={handleSubmit}>Apply</button>
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

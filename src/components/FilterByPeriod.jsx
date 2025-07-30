import React, { useState, useEffect, useRef } from "react";
import "../css/FilterPopup.css";

export default function FilterByPeriod({ storeName, onClose, onSubmit }) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const minDate = new Date(now);
  minDate.setFullYear(now.getFullYear() - 3);
  const minDateStr = minDate.toISOString().split("T")[0];

  const weekAgoDate = new Date(now);
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const weekAgoStr = weekAgoDate.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(weekAgoStr);
  const [endDate, setEndDate] = useState(today);

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    if (startDate > endDate) {
      alert("End date must be after or equal to start date.");
      return;
    }

    onSubmit({
      store: storeName,
      start: startDate,
      end: endDate,
    });
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content" ref={popupRef}>
        <h2>Filter by Date Range</h2>
        <p>
          <b>Store:</b> {storeName}
        </p>

        <div
          onClick={() => document.getElementById("start-date").showPicker?.()}
          style={{
            display: "inline-block",
            width: "60%",
            marginBottom: "12px",
            cursor: "pointer",
          }}
        >
          <label>Start Date:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            min={minDateStr}
            max={today}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: "6px" }}
          />
        </div>

        <div
          onClick={() => document.getElementById("end-date").showPicker?.()}
          style={{
            display: "inline-block",
            width: "60%",
            marginBottom: "12px",
            cursor: "pointer",
          }}
        >
          <label>End Date:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            min={startDate}
            max={today}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: "100%", padding: "6px" }}
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

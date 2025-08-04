import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/FilterPopup.css";

export default function FilterBySelectedDays({ storeName, onClose, onSubmit }) {
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 3);

  const [selectedDates, setSelectedDates] = useState([]);
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

  const toggleDate = (date) => {
    const exists = selectedDates.find(
      (d) => d.toDateString() === date.toDateString(),
    );
    if (exists) {
      setSelectedDates(
        selectedDates.filter((d) => d.toDateString() !== date.toDateString()),
      );
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const isSelected = (date) => {
    return selectedDates.some((d) => d.toDateString() === date.toDateString());
  };

  const formatDateCH = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };

  const handleSubmit = () => {
    if (!selectedDates.length) {
      alert("Please select at least one day.");
      return;
    }

    const formatted = selectedDates
      .sort((a, b) => a - b)
      .map((d) => formatDateCH(d));

    onSubmit({
      store: storeName,
      days: formatted,
      startTime: "00:00",
      endTime: "23:59",
    });

    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content" ref={popupRef}>
        <h2>Filter Multiple Days</h2>
        <p>
          <b>Store:</b> {storeName}
        </p>

        <label>Select Days:</label>
        <div className="datepicker-wrapper">
          <DatePicker
            inline
            minDate={minDate}
            maxDate={today}
            calendarClassName="multi-select-calendar"
            dayClassName={(date) =>
              isSelected(date) ? "selected-calendar-day" : ""
            }
            renderDayContents={(day, date) => (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  toggleDate(date);
                }}
              >
                {day}
              </div>
            )}
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

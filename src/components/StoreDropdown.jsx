// ✅ StoreDropdown.jsx (with loading popup)
import { useState, useEffect, useRef } from "react";
import {
  fetchUserStores,
  fetchTodayDataIfStoreHasCameras,
  fetchDataByTime,
  fetchDataByPeriod,
  fetchDataByDaysWithTime,
} from "../api/stores";

import FilterBySingleDay from "./FilterBySingleDay";
import FilterByPeriod from "./FilterByPeriod";
import FilterBySelectedDays from "./FilterBySelectedDays";
import Loading from "../Loading";
import "../css/Dropdown.css";

export default function StoreDropdown({
  setPopup,
  setChartData,
  setChartMeta,
}) {
  const [stores, setStores] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredStore, setHoveredStore] = useState(null);
  const [showSingleDayPopup, setShowSingleDayPopup] = useState(false);
  const [showPeriodPopup, setShowPeriodPopup] = useState(false);
  const [showSelectedDaysPopup, setShowSelectedDaysPopup] = useState(false);
  const [popupStore, setPopupStore] = useState(null);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);
  const hoverZoneRef = useRef(null);

  useEffect(() => {
    async function loadStores() {
      setLoading(true);
      try {
        const result = await fetchUserStores();
        const valid = result.filter(
          (s) => Array.isArray(s.cameras) && s.cameras.length > 0,
        );
        setStores(valid);

        if (valid.length > 0) {
          const first = valid[0];
          const data = await fetchTodayDataIfStoreHasCameras(first);
          setChartData(data);
          setChartMeta({
            store: first.name,
            type: "today",
            date: new Date().toISOString().split("T")[0],
          });
        }
      } catch (err) {
        setPopup({ message: err.message, type: err.type || "error" });
      } finally {
        setLoading(false);
      }
    }
    loadStores();
  }, [setPopup, setChartData, setChartMeta]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
        setHoveredStore(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startCloseTimer = () => {
    closeTimerRef.current = setTimeout(() => {
      setMenuOpen(false);
      setHoveredStore(null);
    }, 3000);
  };

  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleStoreClick = async (storeName) => {
    const store = stores.find((s) => s.name === storeName);
    if (!store || store.cameras?.length === 0) {
      setPopup({ message: "⚠️ Store has no cameras", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const data = await fetchTodayDataIfStoreHasCameras(store);
      setChartData(data);
      setChartMeta({
        store: store.name,
        type: "today",
        date: new Date().toISOString().split("T")[0],
      });
      setMenuOpen(false);
      setHoveredStore(null);
    } catch (err) {
      setPopup({ message: err.message, type: err.type || "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (type, storeName) => {
    setPopupStore(storeName);
    if (type === "time") setShowSingleDayPopup(true);
    else if (type === "period") setShowPeriodPopup(true);
    else if (type === "days_time") setShowSelectedDaysPopup(true);
  };

  const handleSingleDaySubmit = async ({ store, date }) => {
    setLoading(true);
    try {
      const data = await fetchDataByTime({
        store,
        date,
        startTime: "00:00",
        endTime: "23:59",
      });
      if (!data || Object.keys(data).length === 0) {
        setPopup({
          message: "⚠️ No data for this day. Please try another day.",
          type: "warning",
        });
        return;
      }
      setChartData(data);
      setChartMeta({ store, type: "single", date });
    } catch (err) {
      setPopup({
        message: err.message || "❌ Failed to fetch data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodSubmit = async ({ store, start, end }) => {
    setLoading(true);
    try {
      const data = await fetchDataByPeriod({ store, start, end });
      if (!data || data.length === 0) {
        setPopup({
          message: "⚠️ No data for this range. Try other dates.",
          type: "warning",
        });
        return;
      }
      setChartData(data);
      setChartMeta({ store, type: "period", startDate: start, endDate: end });
    } catch (err) {
      setPopup({
        message: err.message || "❌ Failed to fetch range data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectedDaysSubmit = async ({ store, days }) => {
    setLoading(true);
    try {
      const data = await fetchDataByDaysWithTime({
        store,
        days,
        startTime: "00:00",
        endTime: "23:59",
      });
      if (!data || Object.keys(data).length === 0) {
        setPopup({
          message: "⚠️ No data for these days.",
          type: "warning",
        });
        return;
      }
      setChartData(data);
      setChartMeta({
        store,
        type: "days_time",
        days,
        startTime: "00:00",
        endTime: "23:59",
      });
    } catch (err) {
      setPopup({
        message: err.message || "❌ Failed to fetch data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-dropdown-container">
      <div className="align-menu" ref={dropdownRef}>
        <button
          className="dropdown-button"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          Stores ▾
        </button>

        {menuOpen && (
          <div
            className="horizontal-menu"
            ref={hoverZoneRef}
            onMouseEnter={cancelCloseTimer}
            onMouseLeave={startCloseTimer}
          >
            {stores.map((store) => (
              <div
                key={store.name}
                className="horizontal-item"
                onMouseEnter={() => setHoveredStore(store.name)}
              >
                <div
                  onClick={(e) => {
                    if (!e.target.closest(".submenu-under")) {
                      handleStoreClick(store.name);
                    }
                  }}
                >
                  {store.name}
                </div>

                {hoveredStore === store.name && (
                  <div
                    className="submenu-under"
                    onMouseEnter={cancelCloseTimer}
                    onMouseLeave={startCloseTimer}
                  >
                    <div onClick={() => handleFilterClick("time", store.name)}>
                      🕒 Filter by Single Day
                    </div>
                    <div
                      onClick={() => handleFilterClick("period", store.name)}
                    >
                      📅 Filter by Date Range
                    </div>
                    <div
                      onClick={() => handleFilterClick("days_time", store.name)}
                    >
                      📆 Filter Multiple Days
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showSingleDayPopup && (
          <FilterBySingleDay
            storeName={popupStore}
            onClose={() => setShowSingleDayPopup(false)}
            onSubmit={handleSingleDaySubmit}
          />
        )}

        {showPeriodPopup && (
          <FilterByPeriod
            storeName={popupStore}
            onClose={() => setShowPeriodPopup(false)}
            onSubmit={handlePeriodSubmit}
          />
        )}

        {showSelectedDaysPopup && (
          <FilterBySelectedDays
            storeName={popupStore}
            onClose={() => setShowSelectedDaysPopup(false)}
            onSubmit={handleSelectedDaysSubmit}
          />
        )}
      </div>

      {loading && <Loading text="Loading store data..." />}
    </div>
  );
}

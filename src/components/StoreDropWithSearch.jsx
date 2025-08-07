import { useState, useEffect, useRef } from "react";
import {
  fetchUserStores,
  fetchTodayDataIfStoreHasCameras,
  fetchDataByTime,
  fetchDataByPeriod,
  fetchDataByDaysWithTime,
  fetchDataByDayOrDays,
} from "../api/stores";

import FilterBySingleDay from "./FilterBySingleDay";
import FilterByPeriod from "./FilterByPeriod";
import FilterBySelectedDays from "./FilterBySelectedDays";
import Loading from "../Loading";
import "../css/Dropdown.css";

// 🔒 Token revoked handler
function handleRevokedToken(errText, status) {
  if (status === 401 && errText.includes("Token revoked")) {
    console.warn("🚫 Token revoked in StoreDropdown");
    localStorage.clear();
    window.location.href = "/";
  }
}

export default function StoreDropdown({ setPopup, setChartData, setChartMeta }) {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
        const result = await fetchUserStores().catch((err) => {
          if (err.message?.includes("Token revoked")) {
            handleRevokedToken(err.message, 401);
            return [];
          }
          throw err;
        });

        const valid = result.filter(
          (s) => Array.isArray(s.cameras) && s.cameras.length > 0
        );
        valid.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        );

        setStores(valid);

        if (valid.length > 0) {
          const first = valid[0];
          try {
            const data = await fetchTodayDataIfStoreHasCameras(first);
            setChartData(data);
            setChartMeta({
              store: first.name,
              type: "today",
              date: new Date().toISOString().split("T")[0],
            });
          } catch (err) {
            if (err.message?.includes("Token revoked")) {
              handleRevokedToken(err.message, 401);
              return;
            }
            throw err;
          }
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
      if (err.message?.includes("Token revoked")) {
        handleRevokedToken(err.message, 401);
        return;
      }
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

  const getHighlightedText = (text, highlight) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <input
              type="text"
              className="store-search-input"
              placeholder="🔍 Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredStores.map((store) => (
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
                  {getHighlightedText(store.name, searchTerm)}
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
                    <div onClick={() => handleFilterClick("period", store.name)}>
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

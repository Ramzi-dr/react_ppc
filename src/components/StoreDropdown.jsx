// StoreDropdown.jsx — search + all filtrations + premium reports
import { useState, useEffect, useRef } from "react";
import {
  fetchUserStores,
  fetchTodayDataIfStoreHasCameras,
  fetchDataByTime,
  fetchDataByPeriod,
  fetchDataByDayOrDays,
} from "../api/stores";

import FilterBySingleDay from "./FilterBySingleDay";
import FilterByPeriod from "./FilterByPeriod";
import FilterBySelectedDays from "./FilterBySelectedDays";
import Loading from "../Loading";
import "../css/Dropdown.css";

// 🔒 Token revoked handler
function handleRevokedToken(errText, status) {
  if (status === 401 && errText?.includes("Token revoked")) {
    console.warn("🚫 Token revoked in StoreDropdown");
    localStorage.clear();
    window.location.href = "/";
  }
}

// 🏷️ Simple premium popup (click-away to dismiss)
function PremiumPopup({ type, onClose }) {
  if (!type) return null;
  const label =
    type === "weekly"
      ? "Weekly Report"
      : type === "monthly"
      ? "Monthly Report"
      : "Annual Report";
  return (
    <div
      className="premium-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="premium-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "20px 22px",
          width: "min(92vw, 420px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{label}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
        <p style={{ marginTop: 12 }}>
          This feature is available in the <b>Premium version</b>.
        </p>
        <button
          onClick={onClose}
          className="btn"
          style={{
            marginTop: 10,
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: "pointer",
            background: "#f7f7f7",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function StoreDropdown({ setPopup, setChartData, setChartMeta, chartMeta }) {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredStore, setHoveredStore] = useState(null);

  const [showSingleDayPopup, setShowSingleDayPopup] = useState(false);
  const [showPeriodPopup, setShowPeriodPopup] = useState(false);
  const [showSelectedDaysPopup, setShowSelectedDaysPopup] = useState(false);
  const [popupStore, setPopupStore] = useState(null);

  // ⭐ premium popup
  const [premiumType, setPremiumType] = useState(null); // "weekly" | "monthly" | "annual" | null

  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);
  const hoverZoneRef = useRef(null);

  // ---------- load stores + set first store today data ----------
  useEffect(() => {
    async function loadStores() {
      setLoading(true);
      try {
        const result = await fetchUserStores().catch((err) => {
          if (err?.message?.includes("Token revoked")) {
            handleRevokedToken(err.message, 401);
            return [];
          }
          throw err;
        });

        const valid = (result || []).filter(
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
            if (err?.message?.includes("Token revoked")) {
              handleRevokedToken(err.message, 401);
              return;
            }
            throw err;
          }
        }
      } catch (err) {
        setPopup({ message: err.message || "Failed to load stores", type: err.type || "error" });
      } finally {
        setLoading(false);
      }
    }
    loadStores();
  }, [setPopup, setChartData, setChartMeta]);

  // ---------- close on outside click ----------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
        setHoveredStore(null);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- hover timers ----------
  const startCloseTimer = () => {
    closeTimerRef.current = setTimeout(() => {
      setMenuOpen(false);
      setHoveredStore(null);
      setSearchTerm("");
    }, 3000);
  };
  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // ---------- click store -> today ----------
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
      setSearchTerm("");
    } catch (err) {
      if (err?.message?.includes("Token revoked")) {
        handleRevokedToken(err.message, 401);
        return;
      }
      setPopup({ message: err.message || "Failed to fetch today's data", type: err.type || "error" });
    } finally {
      setLoading(false);
    }
  };

  // ---------- open filter popups ----------
  const handleFilterClick = (type, storeName) => {
    setPopupStore(storeName);
    if (type === "time") setShowSingleDayPopup(true);
    else if (type === "period") setShowPeriodPopup(true);
    else if (type === "days_time") setShowSelectedDaysPopup(true);
  };

  // ---------- SUBMIT HANDLERS ----------
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
      setMenuOpen(false);
      setHoveredStore(null);
      setSearchTerm("");
    } catch (err) {
      if (err?.message?.includes("Token revoked")) {
        handleRevokedToken(err.message, 401);
        return;
      }
      setPopup({ message: err.message || "❌ Failed to fetch data.", type: "error" });
    } finally {
      setLoading(false);
      setShowSingleDayPopup(false);
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
      setMenuOpen(false);
      setHoveredStore(null);
      setSearchTerm("");
    } catch (err) {
      if (err?.message?.includes("Token revoked")) {
        handleRevokedToken(err.message, 401);
        return;
      }
      setPopup({ message: err.message || "❌ Failed to fetch range data.", type: "error" });
    } finally {
      setLoading(false);
      setShowPeriodPopup(false);
    }
  };

  const handleSelectedDaysSubmit = async ({ store, days }) => {
    setLoading(true);
    try {
      const data = await fetchDataByDayOrDays({ store, days });
      if (!data || Object.keys(data).length === 0) {
        setPopup({ message: "⚠️ No data for these days.", type: "warning" });
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
      setMenuOpen(false);
      setHoveredStore(null);
      setSearchTerm("");
    } catch (err) {
      if (err?.message?.includes("Token revoked")) {
        handleRevokedToken(err.message, 401);
        return;
      }
      setPopup({ message: err.message || "❌ Failed to fetch data.", type: "error" });
    } finally {
      setLoading(false);
      setShowSelectedDaysPopup(false);
    }
  };

  // ---------- search + highlight ----------
  const getHighlightedText = (text, highlight) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`, "gi");
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
          onClick={() => {
            setMenuOpen((prev) => !prev);
            if (menuOpen) setSearchTerm("");
          }}
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
                    {/* Existing filters */}
                    <div onClick={() => handleFilterClick("time", store.name)}>
                      🕒 Filter by Single Day
                    </div>
                    <div onClick={() => handleFilterClick("period", store.name)}>
                      📅 Filter by Date Range
                    </div>
                    <div onClick={() => handleFilterClick("days_time", store.name)}>
                      📆 Filter Multiple Days
                    </div>

                    {/* Premium reports */}
                    <div onClick={() => setPremiumType("weekly")}>🗓️ Weekly Report (Premium)</div>
                    <div onClick={() => setPremiumType("monthly")}>🗓️ Monthly Report (Premium)</div>
                    <div onClick={() => setPremiumType("annual")}>📈 Annual Report (Premium)</div>
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
            initialDays={
              chartMeta?.type === "days_time" &&
              chartMeta?.store === popupStore &&
              Array.isArray(chartMeta.days)
                ? chartMeta.days
                : []
            }
          />
        )}
      </div>

      {/* Premium modal */}
      <PremiumPopup type={premiumType} onClose={() => setPremiumType(null)} />

      {loading && <Loading text="Loading store data..." />}
    </div>
  );
}

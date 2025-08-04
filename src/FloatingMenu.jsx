import { useState, useEffect, useRef } from "react";
import {
  FiLogOut,
  FiSettings,
  FiMenu,
  FiHelpCircle,
  FiHome,
} from "react-icons/fi";
import Popup from "./Popup";
import "./css/FloatingMenu.css";

export default function FloatingMenu({ onToggle }) {
  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState(null);
  const menuRef = useRef(null);

  const isSettingsPage = window.location.pathname.includes("settings");

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      setTimeout(() => onToggle?.(next), 0);
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleGoHome = () => {
    window.location.href = "/home";
  };

  const handleSettings = () => {
    window.location.href = "/settings";
  };

  const handleSupport = () => {
    setPopup({
      type: "info",
      message: (
        <div className="text-center">
          <b>Contact HomeSecurity</b>
          <div className="mt-3 d-flex flex-column align-items-center">
            <button
              className="btn btn-primary"
              onClick={() => {
                setPopup(null);
                window.open("https://www.homesecurity.ch/kontakt", "_blank");
              }}
            >
              Open Support Page
            </button>
          </div>
        </div>
      ),
      onClose: () => setPopup(null),
    });
  };

  const handleLogoutPopup = () => {
    setPopup({
      type: "info",
      message: (
        <div className="text-center">
          ❗{" "}
          <span style={{ color: "green" }}>
            Are you sure you want to logout?
          </span>
          <div className="mt-3 d-flex flex-column align-items-center">
            <button
              className="btn btn-danger mb-2"
              onClick={() => {
                setPopup(null);
                setOpen(false);
                onToggle?.(false);
                handleLogout();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
      onClose: () => {
        setOpen(false);
        onToggle?.(false);
      },
    });
  };

  const menuConfig = isSettingsPage
    ? [
        {
          icon: <FiLogOut className="icon" />,
          bgColor: "#dc3545",
          title: "Logout",
          onClick: handleLogoutPopup,
        },
        {
          icon: <FiHome className="icon" />,
          bgColor: "#28a745",
          title: "Home",
          onClick: handleGoHome,
        },
        {
          icon: <FiHelpCircle className="icon" />,
          bgColor: "#6c757d",
          title: "Support",
          onClick: handleSupport,
        },
      ]
    : [
        {
          icon: <FiLogOut className="icon" />,
          bgColor: "#dc3545",
          title: "Logout",
          onClick: handleLogoutPopup,
        },
        {
          icon: <FiSettings className="icon" />,
          bgColor: "#007bff",
          title: "Settings",
          onClick: handleSettings,
        },
        {
          icon: <FiHelpCircle className="icon" />,
          bgColor: "#6c757d",
          title: "Support",
          onClick: handleSupport,
        },
      ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (open) {
          setOpen(false);
          onToggle?.(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onToggle]);

  const radius = 120;
  const baseRight = 20;
  const baseTop = 10;
  const angleStart = 95;
  const angleEnd = -1;

  const step =
    menuConfig.length > 1
      ? (angleEnd - angleStart) / (menuConfig.length - 1)
      : 0;

  return (
    <div
      ref={menuRef}
      className="floating-menu"
      style={{ top: baseTop, right: baseRight }}
    >
      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => {
            setPopup(null);
            setTimeout(() => popup.onClose?.(), 0);
          }}
        />
      )}

      {menuConfig.map((item, index) => {
        const angleDeg = angleStart + index * step;
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = radius * Math.cos(angleRad);
        const y = radius * Math.sin(angleRad);

        return (
          <button
            key={index}
            title={item.title}
            onClick={item.onClick}
            className={`floating-button ${open ? "open" : ""}`}
            style={{
              right: open ? `${x}px` : "0px",
              top: open ? `${y}px` : "0px",
              backgroundColor: item.bgColor,
            }}
          >
            {item.icon}
          </button>
        );
      })}

      <button onClick={handleToggle} className="menu-toggle-button">
        <FiMenu
          className="menu-icon"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
      </button>
    </div>
  );
}

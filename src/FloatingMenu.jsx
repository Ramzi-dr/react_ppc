import { useState, useEffect, useRef } from "react";
import {
  FiLogOut,
  FiSettings,
  FiMenu,
  FiHelpCircle,
  FiHome,
} from "react-icons/fi";
import Popup from "./Popup";

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState(null);
  const menuRef = useRef(null);

  const isSettingsPage = window.location.pathname.includes("settings");

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
    setOpen(false);
    window.open("https://www.homesecurity.ch/kontakt", "_blank");
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
                handleLogout();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
      onClose: () => setOpen(false),
    });
  };

  const menuConfig = isSettingsPage
    ? [
        {
          icon: <FiLogOut color="white" size={20} />,
          bgColor: "#dc3545",
          title: "Logout",
          onClick: handleLogoutPopup,
        },
        {
          icon: <FiHome color="white" size={20} />,
          bgColor: "#28a745",
          title: "Home",
          onClick: handleGoHome,
        },
        {
          icon: <FiHelpCircle color="white" size={20} />,
          bgColor: "#6c757d",
          title: "Support",
          onClick: handleSupport,
        },
      ]
    : [
        {
          icon: <FiLogOut color="white" size={20} />,
          bgColor: "#dc3545",
          title: "Logout",
          onClick: handleLogoutPopup,
        },
        {
          icon: <FiSettings color="white" size={20} />,
          bgColor: "#007bff",
          title: "Settings",
          onClick: handleSettings,
        },
        {
          icon: <FiHelpCircle color="white" size={20} />,
          bgColor: "#6c757d",
          title: "Support",
          onClick: handleSupport,
        },
      ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const radius = 120; // controls fly-out distance
  const iconSize = 50;
  const baseRight = 20;
  const baseBottom = 10;
  const centerOffset = 30;
  const angleStart = 95;
  const angleEnd = -1;


  const step =
    menuConfig.length > 1
      ? (angleEnd - angleStart) / (menuConfig.length - 1)
      : 0;

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: `${baseBottom}px`,
        right: `${baseRight}px`,

        zIndex: 9999,
      }}
    >
      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => {
            setPopup(null);
            popup.onClose?.();
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
            style={{
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              backgroundColor: item.bgColor,
              border: "none",
              borderRadius: "50%",
              position: "absolute",
              right: open ? `${x}px` : `0px`,
              top: open ? `${y}px` : `0px`,

              opacity: open ? 1 : 0,
              transform: open ? "scale(1)" : "scale(0.5)",
              pointerEvents: open ? "auto" : "none",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1001,
            }}
          >
            {item.icon}
          </button>
        );
      })}

      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "60px",
          height: "60px",
          backgroundColor: "#343a40",
          color: "white",
          border: "none",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          position: "relative",
          zIndex: 10000,
        }}
      >
        <FiMenu
          size={28}
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>
    </div>
  );
}

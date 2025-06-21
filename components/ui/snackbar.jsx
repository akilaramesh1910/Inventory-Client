"use client"

import React, { useEffect } from 'react';

const snackbar = ({ message, open, onClose, severity = "error", autoHideDuration = 6000 }) => {
  useEffect(() => {
    if (open && autoHideDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const severityColors = {
    error: "#ef4444",
    success: "#10b981",
    info: "#3b82f6",
    warning: "#f59e0b", 
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: severityColors[severity] || severityColors.error,
        color: "white",
        padding: "12px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: "300px",
        maxWidth: "calc(100% - 40px)",
        textAlign: "left",
        fontSize: "14px",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          marginLeft: "15px",
          cursor: "pointer",
          fontSize: "20px",
          lineHeight: "1",
          padding: "0 5px",
        }}
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
};

export default snackbar;
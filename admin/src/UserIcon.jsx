import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Alert from "./Alert"; // Import Alert component

const UserIcon = ({ userName, userEmail }) => {
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "?";
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    message: '',
    type: 'error',
  });

  const handleClick = (event) => {
    event.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  // Helper function to show alerts
  const showAlert = (message, type = 'error') => {
    setAlertConfig({
      show: true,
      message,
      type,
    });
  };

  // Function to dismiss alert
  const dismissAlert = () => {
    setAlertConfig({
      ...alertConfig,
      show: false,
    });
  };
  
  const handleLogout = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}admins/logout`, {}, { withCredentials: true });
      if (!res.data.success) {
        throw new Error('Error logging out');
      }
      showAlert('Logged out successfully', 'success');
      
      // Add a small delay before redirecting to ensure the alert is seen
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
    catch(err) {
      showAlert('Error logging out. Please try again.', 'error');
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  };

  return (
    <div 
      className="user-icon-container" 
      style={{ position: "absolute", top: "50px", right: "50px", zIndex: 1001 }}
    >
      {/* Alert component */}
      <Alert 
        message={alertConfig.message}
        type={alertConfig.type}
        show={alertConfig.show}
        onDismiss={dismissAlert}
        autoDismissTime={5000}
      />
      
      {/* User Icon */}
      <div
        onClick={handleClick}
        style={{
          width: "50px",
          height: "50px",
          aspectRatio: "1 / 1",  // Ensures the height is always equal to width
          borderRadius: "50%",
          background: "linear-gradient(to right, #102a74, #1e40af, #2563eb, #3b82f6, #4f46e5)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "22px",
          boxSizing: "border-box", // Ensures padding doesn't affect width & height
        }}
      >
        {userInitial}
      </div>

      {/* User Dropdown */}
      {showDropdown && (
        <div 
          className="user-dropdown"
          style={{
            position: "absolute",
            top: "60px",
            right: "20px",
            backgroundColor: "white",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "16px",
            borderRadius: "8px",
            minWidth: "240px",
            border: "1px solid #e5e7eb",
            zIndex: 50,
            animation: "fadeIn 0.2s ease-out forwards",
            transformOrigin: "top right"
          }}
        >
          <div className="user-info" style={{ marginBottom: "12px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "8px" 
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#3b82f6",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                fontWeight: "bold",
                fontSize: "18px"
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ 
                  color: "#111827", 
                  fontWeight: "600", 
                  margin: 0 
                }}>{userName}</p>
                <p style={{ 
                  color: "#6b7280", 
                  fontSize: "14px", 
                  margin: 0 
                }}>Administrator</p>
              </div>
            </div>
            
            <div style={{ padding: "8px 0" }}>
              <p style={{ 
                color: "#374151", 
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: "4px 0"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {userEmail}
              </p>
            </div>
          </div>

          <hr style={{ 
            border: "none", 
            height: "1px", 
            backgroundColor: "#e5e7eb", 
            margin: "12px 0" 
          }} />

          <button 
            style={{
              width: "100%",
              backgroundColor: "transparent",
              color: "#ef4444",
              border: "1px solid #ef4444",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              hover: {
                backgroundColor: "#fee2e2"
              }
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserIcon;
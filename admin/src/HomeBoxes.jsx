import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const featuresList = [
  { icon: "💺", name: "Seats Management", section: "seats" },
  { icon: "🗓️", name: "Seat Bookings", section: "bookings" },
  { icon: "📢", name: "Announcements", section: "announcements" },
  { icon: "📰", name: "Articles Requests", section: "articles" },
  { icon: "✏️", name: "Article Management", section: "article-management" },
  { icon: "💬", name: "Grievances", section: "complaints" }
];

const HomeBoxes = ({ setActiveSection }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [featureIndex, setFeatureIndex] = useState(0);

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}announcements/get-all`, { 
          withCredentials: true 
        });
        setAnnouncements(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements");
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (announcements.length > 3) {
        setAnnouncementIndex((prev) => (prev + 1) % (announcements.length - 2));
      }
      
      if (featuresList.length > 5) {
        setFeatureIndex((prev) => (prev + 1) % (featuresList.length - 4));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [announcements]);

  // Handle feature click
  const handleFeatureClick = (section) => {
    setActiveSection(section); // Use the prop to update the parent's state
  };

  // Render announcement items
  const renderAnnouncementItems = () => {
    if (loading) {
      return <div className="loading">Loading announcements...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (announcements.length === 0) {
      return <div className="no-data">No announcements available</div>;
    }

    const itemsToShow = announcements.length <= 3 
      ? announcements 
      : announcements.slice(announcementIndex, announcementIndex + 3);

    return (
      <AnimatePresence mode="popLayout">
        {itemsToShow.map((announcement, index) => (
          <motion.p
            key={`${announcement._id || announcement.title}-${index}`}
            className="notification-item"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            layout
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <span style={{ color: "gold", fontWeight: "bold" }}>{announcement.title}: </span>
            {announcement.description}
          </motion.p>
        ))}
      </AnimatePresence>
    );
  };

  // CSS styles
  const headingStyle = {
    textAlign: "center",
    marginBottom: "1rem",
    padding: "0.5rem",
    borderBottom: "2px solid #e5e7eb"
  };

  const featureItemStyle = {
    padding: "0.5rem 0.75rem",
    marginBottom: "0.5rem",
    borderRadius: "0.5rem",
    backgroundColor: "#2a2d3e",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  };

  const featuresToShow = featuresList.length <= 6 
    ? featuresList 
    : featuresList.slice(featureIndex, featureIndex + 6);

  return (
    <div className="home-boxes">
      {/* Announcements Section */}
      <motion.div className="home-box announcements-box">
        <h3 style={headingStyle}>📢 Announcements</h3>
        <div className="announcements-list">
          {renderAnnouncementItems()}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div className="home-box features-box">
        <h3 style={headingStyle}>🔍 Quick Access</h3>
        <div className="features-list">
          <AnimatePresence mode="popLayout">
            {featuresToShow.map((feature, index) => (
              <motion.div
                key={`${feature.section}-${index}`}
                className="feature-item"
                style={featureItemStyle}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                whileHover={{ 
                  scale: 1.03,
                  backgroundColor: "#3a3f55"
                }}
                onClick={() => handleFeatureClick(feature.section)}
                layout
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <span style={{ fontSize: "1.5rem" }}>{feature.icon}</span>
                <span style={{ fontWeight: "500" }}>{feature.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeBoxes;
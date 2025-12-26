import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import Alert from "./Alert";
import "./Student.css";

const AdminSearchStudents = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [showBooks, setShowBooks] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "info"
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const showAlert = (message, type = "info") => {
    setAlert({
      show: true,
      message,
      type
    });
  };

  const dismissAlert = () => {
    setAlert(prev => ({
      ...prev,
      show: false
    }));
  };

  const fetchStudentDetails = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!rollNumber.trim()) {
      showAlert("Please enter a roll number to search", "warning");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}admins/get-student-by-rollNo/${rollNumber}`, {
        withCredentials: true
      });
      
      setStudent(response.data.data);
      showAlert("Student details fetched successfully", "success");
    } catch (err) {
      console.error("Error fetching student details:", err);
      setStudent(null);
      setError(err.response?.data?.message || "Failed to fetch student details. Please try again later.");
      showAlert(err.response?.data?.message || "Failed to fetch student details. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!student) return;
    
    if (!window.confirm(`Are you sure you want to remove the student ${student.name} (${student.rollNo})? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await axios.delete(`${API_BASE_URL}admins/remove-student/${student.rollNo}`, {
        withCredentials: true
      });
      
      setStudent(null);
      showAlert("Student removed successfully", "success");
    } catch (err) {
      console.error("Error removing student:", err);
      showAlert(err.response?.data?.message || "Failed to remove student. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-articles-container">
      {/* Alert component at the top */}
      <Alert 
        message={alert.message}
        type={alert.type}
        show={alert.show}
        onDismiss={dismissAlert}
        autoDismissTime={5000}
      />
      
      <div className="admin-articles-header">
        <h1><FontAwesomeIcon icon={faUserGraduate} /> Student Lookup</h1>
      </div>

      <div className="search-section">
        <form onSubmit={fetchStudentDetails} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter student roll number"
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={isLoading}>
              {isLoading ? 
                <div className="button-spinner"></div> : 
                <FontAwesomeIcon icon={faSearch} />
              }
            </button>
          </div>
        </form>
      </div>

      {isLoading && !student ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching for student...</p>
        </div>
      ) : error && !student ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      ) : student ? (
        <div className="student-details-container">
          <div className="student-details-panel">
            <div className="details-header">
              <h2>Student Information</h2>
            </div>
            <div className="details-content">
              <div className="student-basic-info">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{student.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Roll Number:</span>
                  <span className="info-value">{student.rollNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{student.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date of Birth:</span>
                  <span className="info-value">{formatDate(student.dateOfBirth) || "Not specified"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Department:</span>
                  <span className="info-value">{student.department || "Not specified"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Degree:</span>
                  <span className="info-value">{student.degree || "Not specified"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone Number:</span>
                  <span className="info-value">{student.phoneNumber === student.email ?  "Not set": student.phoneNumber || "Not set"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Registration Date:</span>
                  <span className="info-value">{formatDate(student.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Account Status:</span>
                  <span className={`status-badge ${student.isAdminApproved ? "shared" : "requested"}`}>
                    {student.isAdminApproved ? "Complete" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      ) : (
        <div className="no-student-selected">
          <p>Enter a roll number and click search to view student details.</p>
        </div>
      )}
    </div>
  );
};

export default AdminSearchStudents;

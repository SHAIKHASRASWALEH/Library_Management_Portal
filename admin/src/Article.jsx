import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Article.css";
import "./Alert.css";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import Alert from "./Alert"; // Import the Alert component

const AdminManageArticles = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryDays, setExpiryDays] = useState("");
  
  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "info"
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}article-sharing/get`, {
        withCredentials: true
      });
      setRequests(response.data.data || []);
      if (response.data.data?.length === 0) {
        showAlert("No article requests found.", "info");
      }
    } catch (err) {
      console.error("Error fetching article requests:", err);
      setError("Failed to load article requests. Please try again later.");
      showAlert("Failed to load article requests. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFileUpload(e.target.files[0]);
  };

  const handleApproveRequest = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      if(expiryDays === "") {
        showAlert("Please enter the number of days until expiration.", "warning");
        return;
      }

      setUploadStatus("uploading");
      
      const response = await axios.patch(`${API_BASE_URL}article-sharing/approve`, {
        id: selectedRequest._id,
        expiryDays: expiryDays
      }, {
        withCredentials: true
      });
      
      // Get the validTill date from the response if available
      const validTill = response.data?.validTill || 
        new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toISOString();
      
      // Update the requests list
      setRequests(requests.map(req => 
        req._id === selectedRequest._id 
          ? { 
              ...req, 
              status: "shared", 
              validTill: validTill,
              sharedAt: new Date().toISOString() 
            } 
          : req
      ));

      // Update the selected request in the UI
      setSelectedRequest(prev => ({
        ...prev,
        status: "shared",
        validTill: validTill,
        sharedAt: new Date().toISOString()
      }));

      setUploadStatus("success");
      setExpiryDays("");
      showAlert("Article request approved successfully!", "success");
    }  catch (error) {
      console.error("Error approving article request:", error);
      setUploadStatus("error");
      
      // Extract error message from HTML response
      let errorMessage = "Failed to approve the request. Please try again.";
      
      if (error.response?.data) {
        // If the response data is HTML
        if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
          // Try to extract the error message from the HTML
          const match = error.response.data.match(/<pre>Error: ([^<]+)<br>/);
          if (match && match[1]) {
            errorMessage = "Failed to approve article request: "+match[1];
          }
        } else {
          // If it's a regular JSON response with an error message
          errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      showAlert(errorMessage, "error");
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    try {
      setUploadStatus("uploading");
      
      await axios.patch(`${API_BASE_URL}article-sharing/reject`, {
        id: selectedRequest._id,
        additionalInfo: rejectionReason || "No reason provided"
      }, {
        withCredentials: true
      });

      // Update requests list
      setRequests(requests.map(req => 
        req._id === selectedRequest._id 
          ? { ...req, status: "rejected", additionalInfo: rejectionReason } 
          : req
      ));

      // Update selected request
      setSelectedRequest(prev => ({
        ...prev,
        status: "rejected",
        additionalInfo: rejectionReason
      }));

      setRejectionReason("");
      setUploadStatus("success");
      showAlert("Article request rejected successfully.", "success");
    } catch (error) {
      console.error("Error rejecting article request:", error);
      setUploadStatus("error");
      showAlert(error.response?.data?.message || "Failed to reject the request. Please try again.", "error");
    }
  };

  const handleUpdateRequest = async (newStatus) => {
    if (!selectedRequest) return;

    try {
      setUploadStatus("uploading");
      
      await axios.patch(`${API_BASE_URL}article-sharing/update`, {
        id: selectedRequest._id,
        status: newStatus
      }, {
        withCredentials: true
      });

      // Update requests list
      setRequests(requests.map(req => 
        req._id === selectedRequest._id 
          ? { ...req, status: newStatus } 
          : req
      ));

      // Update selected request
      setSelectedRequest(prev => ({
        ...prev,
        status: newStatus
      }));
      
      setUploadStatus("success");
      showAlert(`Request status updated to ${newStatus} successfully.`, "success");
    } catch (error) {
      console.error("Error updating status:", error);
      setUploadStatus("error");
      showAlert(error.response?.data?.message || "Failed to update status. Please try again.", "error");
    }
  };

  const handleDeleteRequest = async () => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }
    try {
      setUploadStatus("uploading");
      
      await axios.delete(`${API_BASE_URL}article-sharing/delete/${selectedRequest._id}`, {
        withCredentials: true
      });

      setRequests(requests.filter(req => req._id !== selectedRequest._id));
      setSelectedRequest(null);
      setUploadStatus("success");
      showAlert("Article request deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting request:", error);
      setUploadStatus("error");
      showAlert(error.response?.data?.message || "Failed to delete the request. Please try again.", "error");
    }
  };

  const getFilteredRequests = () => {
    if (statusFilter === "all") return requests;
    return requests.filter(req => req.status === statusFilter);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-articles-container">
      {/* Add Alert component at the top */}
      <Alert 
        message={alert.message}
        type={alert.type}
        show={alert.show}
        onDismiss={dismissAlert}
        autoDismissTime={5000}
      />
      
      <div className="admin-articles-header">
        <h1>📝 Manage Article Requests</h1>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading article requests...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchRequests}>Try Again</button>
        </div>
      ) : (
        <div className="admin-articles-content">
          <div className="requests-panel">
            <div className="filter-controls">
              <div className="status-filters">
                <button 
                  className={statusFilter === "all" ? "active" : ""}
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </button>
                <button 
                  className={statusFilter === "requested" ? "active" : ""}
                  onClick={() => setStatusFilter("requested")}
                >
                  Requested
                </button>
                <button 
                  className={statusFilter === "shared" ? "active" : ""}
                  onClick={() => setStatusFilter("shared")}
                >
                  Shared
                </button>
                <button 
                  className={statusFilter === "rejected" ? "active" : ""}
                  onClick={() => setStatusFilter("rejected")}
                >
                  Rejected
                </button>
              </div>
              <div className="refresh-control">
                <button onClick={fetchRequests} className="refresh-button">
                  <FontAwesomeIcon icon={faSyncAlt} />
                </button>
              </div>
            </div>

            <div className="requests-list">
              {getFilteredRequests().length === 0 ? (
                <div className="no-requests">
                  <p>No article requests found for the selected filter.</p>
                </div>
              ) : (
                getFilteredRequests().map((request) => (
                  <div 
                    key={request._id} 
                    className={`request-item ${selectedRequest && selectedRequest._id === request._id ? 'selected' : ''} ${request.status}`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="request-header">
                      <h3>{request.title}</h3>
                      <span className={`status-badge ${request.status}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div className="request-info">
                      <p><strong>DOI:</strong> {request.DOI || "Not provided"}</p>
                      <p><strong>Requested on:</strong> {formatDate(request.requestedAt)}</p>
                      {request.status === "shared" && (
                        <p><strong>Valid till:</strong> {formatDate(request.validTill)}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="details-panel">
            {selectedRequest ? (
              <div className="request-details">
                <h2>Request Details</h2>
                <div className="details-section">
                  <h3>{selectedRequest.title}</h3>
                  <p><strong>Journal:</strong> {selectedRequest.journal || "Not specified"}</p>
                  <p><strong>Author(s):</strong> {selectedRequest.authors || "Not specified"}</p>
                  <p><strong>DOI:</strong> {selectedRequest.DOI || "Not provided"}</p>
                  <p><strong>Publication Year:</strong> {selectedRequest.publicationYear || "Not specified"}</p>
                  <p><strong>Requested on:</strong> {formatDate(selectedRequest.requestedAt)}</p>
                  <p><strong>Student Roll.no:</strong> {selectedRequest.studentId.rollNo || "Not specified"}</p>
                  <p><strong>Status:</strong> <span className={`status-text ${selectedRequest.status}`}>{selectedRequest.status}</span></p>

                  {selectedRequest.additionalInfo && (
                    <div className="request-notes">
                      <h4>Additional Information:</h4>
                      <p>{selectedRequest.additionalInfo}</p>
                    </div>
                  )}

                  {selectedRequest.status === "shared" && (
                    <div className="shared-info">
                      {selectedRequest.link && (
                        <>
                          <h4>Article Link:</h4>
                          <p><a href={selectedRequest.link} target="_blank" rel="noopener noreferrer">{selectedRequest.link}</a></p>
                        </>
                      )}
                      <p><strong>Valid until:</strong> {formatDate(selectedRequest.validTill)}</p>
                      <p><strong>Shared on:</strong> {formatDate(selectedRequest.sharedAt)}</p>
                    </div>
                  )}
                </div>

                <div className="action-section">
                  <h3>Actions</h3>

                  {selectedRequest.status === "requested" && (
                    <>
                      <div className="approve-section">
                        <h4>Approve Request</h4>
                        <form onSubmit={handleApproveRequest}>
                          <div className="input-container">
                            <label htmlFor="expiryDays">Expires in (days):</label>
                            <input
                              type="number"
                              id="expiryDays"
                              value={expiryDays}
                              onChange={(e) => setExpiryDays(e.target.value)}
                              placeholder="Number of days until expiration"
                              min="1"
                              required
                            />
                          </div>

                          <button 
                            type="submit" 
                            className="action-button approve"
                            disabled={uploadStatus === "uploading"}
                          >
                            {uploadStatus === "uploading" ? "Processing..." : "Approve Request"}
                          </button>
                        </form>
                      </div>

                      <div className="reject-section">
                        <h4>Reject Request</h4>
                        <div className="rejection-form">
                          <label htmlFor="rejectionReason">Rejection Reason (optional):</label>
                          <textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide a reason for rejecting this request (optional)"
                          ></textarea>

                          <button 
                            className="action-button reject"
                            onClick={handleRejectRequest}
                            disabled={uploadStatus === "uploading"}
                          >
                            {uploadStatus === "uploading" ? "Processing..." : "Reject Request"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="delete-section">
                    <button 
                      className="action-button delete"
                      onClick={handleDeleteRequest}
                      disabled={uploadStatus === "uploading"}
                    >
                      {uploadStatus === "uploading" ? "Processing..." : "Delete Request"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <p>Select a request from the list to view details and take action.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageArticles;
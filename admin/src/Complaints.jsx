import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ResolutionModal from "./ResolutionModal"; 
import Alert from "./Alert"; // Import Alert component
import "./Complaints.css";

const Complaints = ({ userType }) => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [resolutionComments, setResolutionComments] = useState({});
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'complaint', 'feedback'
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    message: '',
    type: 'error',
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(complaints.filter(item => 
        item.category.toLowerCase() === activeFilter
      ));
    }
  }, [activeFilter, complaints]);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}complaints`, { withCredentials: true });
      setComplaints(response.data.data);
      setFilteredComplaints(response.data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      showAlert('Error fetching grievances. Please try again.', 'error');
    }
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

  const handleResolveComplaint = async (id) => {
    if (!resolutionComments[id]) {
      showAlert('Please enter a resolution comment', 'warning');
      return;
    }
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}complaints/${id}`, { status: 'resolved', comment: resolutionComments[id] }, { withCredentials: true });
      showAlert('Grievance resolved successfully!', 'success');
      setShowModal(false);
      fetchComplaints();
    } catch (error) {
      console.error('Error resolving complaint:', error);
      showAlert('Error resolving grievance. Please try again.', 'error');
    }
  };
  
  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grievance?')) {
      return;
    }
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}complaints/${id}`, { withCredentials: true });
      showAlert('Grievance deleted successfully!', 'success');
      fetchComplaints();
    } catch (error) {
      console.error('Error deleting complaint:', error);
      showAlert('Error deleting grievance. Please try again.', 'error');
    }
  };

  // Function to open attachments in a new tab
  const openAttachment = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="complaints-container">
      {/* Alert component */}
      <Alert 
        message={alertConfig.message}
        type={alertConfig.type}
        show={alertConfig.show}
        onDismiss={dismissAlert}
        autoDismissTime={5000}
      />
      
      <h3>✉️ Grievance Management</h3>
      
      {/* Filter buttons */}
      <div className="filter-buttons" style={{ marginBottom: '20px' }}>
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'complaint' ? 'active' : ''}`}
          onClick={() => setActiveFilter('complaint')}
        >
          Grievances
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveFilter('feedback')}
        >
          Feedbacks
        </button>
      </div>
      
      <div className="table-wrapper">
        <table className="complaints-table">
          <thead>
            <tr>
              <th>Student Roll Number</th>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Attachments</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint) => (
              <tr 
                key={complaint._id} 
                className={complaint.status === 'resolved' ? 'resolved-row' : 'pending-row'}
              >
                <td>{complaint.studentId.rollNo}</td>
                <td>{complaint.title}</td>
                <td>{complaint.description}</td>
                <td>{complaint.category === "Complaint" ? "Grievance": "Feedback"}</td>
                <td>
                  {complaint.attachments && complaint.attachments.length > 0 ? (
                    <div className="attachments-container">
                      {complaint.attachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                          <button 
                            className="attachment-link"
                            onClick={() => openAttachment(attachment)}
                          >
                            {attachment.filename || `Attachment ${index + 1}`}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    'No attachments'
                  )}
                </td>
                <td>
                  {complaint.comments.length > 0 ? (
                    complaint.comments.map((c) => (
                      <div key={c._id}>
                        {c.comment}
                      </div>
                    ))
                  ) : 'No comments'}
                </td>
                {userType === 'admin' && (
                  <td className="action-buttons">
                    {complaint.status !== 'resolved' && (
                      <button 
                        className="resolve-btn" 
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowModal(true);
                        }}
                      >
                        Resolve
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => handleDeleteComplaint(complaint._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Resolution Modal */}
      <ResolutionModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        complaint={selectedComplaint}
        resolutionComments={resolutionComments}
        setResolutionComments={setResolutionComments}
        handleResolveComplaint={handleResolveComplaint}
      />
    </div>
  );
};

export default Complaints;
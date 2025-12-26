import React from "react";

const ResolutionModal = ({ showModal, onClose, complaint, resolutionComments, setResolutionComments, handleResolveComplaint }) => {
  if (!showModal || !complaint) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>Resolve Grievance</h4>
        <p><strong>Title:</strong> {complaint.title}</p>
        <p><strong>Description:</strong> {complaint.description}</p>

        <input 
          type="text" 
          placeholder="Enter resolution comment" 
          value={resolutionComments[complaint._id] || ''} 
          onChange={(e) => setResolutionComments({ 
            ...resolutionComments, 
            [complaint._id]: e.target.value 
          })} 
        />

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => handleResolveComplaint(complaint._id)}>Submit</button>
        </div>
      </div>

      {/* Modal CSS */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 10px;
          max-width: 500px;
          text-align: center;
        }
        .modal-actions {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default ResolutionModal;

// Announcements.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from './Alert'; // Import the Alert component

const Announcements = () => {
  // Character limits for title and description
  const TITLE_MAX_LENGTH = 40;
  const DESCRIPTION_MAX_LENGTH = 150;

  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    description: '',
    imageLink: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Add alert state
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}announcements/get-all`, { withCredentials: true });
      setAnnouncements(response.data.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showAlert('Failed to fetch announcements', 'error');
    }
  };

  // Add function to show alerts
  const showAlert = (message, type = 'success') => {
    setAlert({
      show: true,
      message,
      type
    });
  };

  // Add function to dismiss alerts
  const dismissAlert = () => {
    setAlert({
      ...alert,
      show: false
    });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    const maxLength = field === 'title' ? TITLE_MAX_LENGTH : DESCRIPTION_MAX_LENGTH;
    
    if (value.length <= maxLength) {
      setNewAnnouncement({...newAnnouncement, [field]: value});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', newAnnouncement.title);
    formData.append('description', newAnnouncement.description);
    if (imageFile) {
      formData.append('file', imageFile);
    }

    try {
      if (isEditing && editingId) {
        await axios.patch(`${import.meta.env.VITE_API_BASE_URL}announcements/update`, 
          {id: editingId, title: newAnnouncement.title, description: newAnnouncement.description, file: imageFile},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            },
          }
        );
        showAlert('Announcement updated successfully!', 'success');
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}announcements/add`, 
          formData, 
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        showAlert('Announcement created successfully!', 'success');
      }
      
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      showAlert(`Failed to ${isEditing ? 'update' : 'create'} announcement`, 'error');
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement._id);
    setIsEditing(true);
    setNewAnnouncement({
      title: announcement.title,
      description: announcement.description,
      imageLink: announcement.imageLink
    });
  };

  const resetForm = () => {
    setNewAnnouncement({ title: '', description: '', imageLink: '' });
    setImageFile(null);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}announcements/delete/${id}`, { withCredentials: true });
      showAlert('Announcement deleted successfully!', 'success');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showAlert('Failed to delete announcement', 'error');
    }
  };

  return (
    <div className="announcements-container">
      {/* Add Alert component */}
      <Alert 
        show={alert.show}
        message={alert.message}
        type={alert.type}
        onDismiss={dismissAlert}
        autoDismissTime={5000}
      />
      
      <h3>📢 Announcements Management</h3>
      
      <div className="create-announcement">
        <h4>{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="form-control"
              value={newAnnouncement.title}
              onChange={(e) => handleInputChange(e, 'title')}
              required
              maxLength={TITLE_MAX_LENGTH}
            />
            <small className="text-muted">
              {newAnnouncement.title.length}/{TITLE_MAX_LENGTH} characters
            </small>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={newAnnouncement.description}
              onChange={(e) => handleInputChange(e, 'description')}
              required
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
            <small className="text-muted">
              {newAnnouncement.description.length}/{DESCRIPTION_MAX_LENGTH} characters
            </small>
          </div>
          
          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              className="form-control"
              onChange={handleImageChange}
              accept="image/*"
            />
            {newAnnouncement.imageLink && !imageFile && (
              <div className="mt-2">
                <small>Current Image:</small>
                <img 
                  src={newAnnouncement.imageLink} 
                  alt="Current" 
                  style={{ maxWidth: '100px', maxHeight: '100px', display: 'block' }}
                />
              </div>
            )}
          </div>
          
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Announcement' : 'Create Announcement'}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="announcements-list mt-4">
        <h4>Existing Announcements</h4>
        {announcements.length === 0 ? (
          <p>No announcements yet</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Image</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map(announcement => (
                <tr key={announcement._id}>
                  <td>{announcement.title}</td>
                  <td>{announcement.description}</td>
                  <td>
                    {announcement.imageLink && (
                      <img 
                        src={announcement.imageLink} 
                        alt="Announcement" 
                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                      />
                    )}
                  </td>
                  <td>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEdit(announcement)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(announcement._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Announcements;
import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ArticleManagement.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import Alert from "./Alert"; // Import the Alert component

const ArticleManagement = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [newArticle, setNewArticle] = useState({
    title: "",
    DOI: "",
    description: "",
    authors: "",
    journal: "",
    publicationYear: "",
    link: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [searchDOI, setSearchDOI] = useState("");
  
  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "error"
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Function to show alert
  const showAlert = (message, type = "error") => {
    setAlert({
      show: true,
      message,
      type
    });
  };

  // Function to hide alert
  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}articles/get-all`, {
        withCredentials: true
      });
      setArticles(response.data.data || []);
      if (response.data.data?.length === 0) {
        showAlert("No articles found in the database.", "info");
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to load articles. Please try again later.");
      showAlert("Failed to load articles. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchByDOI = async () => {
    if (!searchDOI.trim()) {
      fetchArticles();
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}articles/DOI/?DOI=${searchDOI}`, {
        withCredentials: true
      });
      
      if (response.data.data) {
        setArticles([response.data.data]);
        showAlert("Article found successfully!", "success");
      } else {
        setArticles([]);
        showAlert("No article found with that DOI.", "warning");
      }
    } catch (err) {
      console.error("Error searching for article:", err);
      setError("Failed to search for article. Please try again.");
      showAlert("Failed to search for article. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFileUpload(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editMode) {
      setSelectedArticle({
        ...selectedArticle,
        [name]: value
      });
    } else {
      setNewArticle({
        ...newArticle,
        [name]: value
      });
    }
  };

  const resetForm = () => {
    setNewArticle({
      title: "",
      DOI: "",
      description: "",
      authors: "",
      journal: "",
      publicationYear: "",
      link: ""
    });
    setFileUpload(null);
    setEditMode(false);
    setSelectedArticle(null);
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    
    if (!fileUpload && !editMode) {
      showAlert("Please upload a PDF file for the article.", "warning");
      return;
    }

    if (!newArticle.title || !newArticle.DOI || !newArticle.description || 
        !newArticle.authors || !newArticle.journal || !newArticle.publicationYear) {
      showAlert("All fields are required (except link which is optional).", "warning");
      return;
    }

    try {
      setUploadStatus("uploading");
      
      const formData = new FormData();
      Object.keys(newArticle).forEach(key => {
        formData.append(key, newArticle[key]);
      });
      
      if (fileUpload) {
        formData.append("file", fileUpload);
      }
      
      const response = await axios.post(`${API_BASE_URL}articles/add`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      setArticles([...articles, response.data.data]);
      setUploadStatus("success");
      showAlert("Article added successfully!", "success");
      resetForm();
      
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Error adding article:", error);
      setUploadStatus("error");
      showAlert("Failed to add article. Please try again.", "error");
    }
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();
    
    if (!selectedArticle) return;
    
    try {
      setUploadStatus("uploading");
      
      const response = await axios.patch(`${API_BASE_URL}articles/update`, {
        id: selectedArticle._id,
        title: selectedArticle.title,
        DOI: selectedArticle.DOI,
        description: selectedArticle.description,
        authors: selectedArticle.authors,
        journal: selectedArticle.journal,
        publicationYear: selectedArticle.publicationYear,
        link: selectedArticle.link
      }, {
        withCredentials: true
      });
      
      setArticles(articles.map(article => 
        article._id === selectedArticle._id 
          ? response.data.data 
          : article
      ));
      
      setUploadStatus("success");
      showAlert("Article updated successfully!", "success");
      resetForm();
      
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating article:", error);
      setUploadStatus("error");
      showAlert("Failed to update article. Please try again.", "error");
    }
  };

  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    
    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}articles/delete/${selectedArticle._id}`, {
        withCredentials: true
      });
      
      setArticles(articles.filter(article => article._id !== selectedArticle._id));
      showAlert("Article deleted successfully!", "success");
      resetForm();
    } catch (error) {
      console.error("Error deleting article:", error);
      showAlert("Failed to delete the article. Please try again.", "error");
    }
  };

  const editArticle = (article) => {
    setSelectedArticle(article);
    setEditMode(true);
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
      {/* Alert component */}
      <Alert 
        message={alert.message}
        type={alert.type}
        show={alert.show}
        onDismiss={hideAlert}
        autoDismissTime={5000}
      />
      
      <div className="admin-articles-header">
        <h1>📚 Article Management</h1>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading articles...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchArticles}>Try Again</button>
        </div>
      ) : (
        <div className="admin-articles-content">
          <div className="requests-panel">
            <div className="filter-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by DOI"
                  value={searchDOI}
                  onChange={(e) => setSearchDOI(e.target.value)}
                />
                <button onClick={handleSearchByDOI}>Search</button>
              </div>
              <div className="refresh-control">
                <button onClick={fetchArticles} className="refresh-button">
                  <FontAwesomeIcon icon={faSyncAlt} /> 
                </button>
              </div>
            </div>

            <div className="requests-list">
              {articles.length === 0 ? (
                <div className="no-requests">
                  <p>No articles found.</p>
                </div>
              ) : (
                articles.map((article) => (
                  <div 
                    key={article._id} 
                    className={`request-item ${selectedArticle && selectedArticle._id === article._id ? 'selected' : ''}`}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="request-header">
                      <h3>{article.title}</h3>
                    </div>
                    <div className="request-info">
                      <p><strong>DOI:</strong> {article.DOI}</p>
                      <p><strong>Journal:</strong> {article.journal}</p>
                      <p><strong>Published:</strong> {article.publicationYear}</p>
                      <p><strong>Added on:</strong> {formatDate(article.createdAt)}</p>
                      {article.link && (
                        <p>
                          <strong>Link:</strong>{" "}
                          <a 
                            href={article.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {article.link}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="details-panel">
            <div className="form-tabs">
              <button 
                className={!editMode ? "tab-active" : ""}
                onClick={() => {
                  setEditMode(false);
                  setSelectedArticle(null);
                }}
              >
                Add New Article
              </button>
              <button 
                className={editMode ? "tab-active" : ""}
                onClick={() => {
                  if (selectedArticle) {
                    setEditMode(true);
                  } else {
                    showAlert("Please select an article to edit", "warning");
                  }
                }}
                disabled={!selectedArticle}
              >
                Edit Article
              </button>
            </div>

            {editMode && selectedArticle ? (
              <div className="article-form">
                <h2>Edit Article</h2>
                <form onSubmit={handleUpdateArticle}>
                  <div className="input-container">
                    <label htmlFor="title">Title:</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={selectedArticle.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="DOI">DOI:</label>
                    <input
                      type="text"
                      id="DOI"
                      name="DOI"
                      value={selectedArticle.DOI}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="authors">Authors:</label>
                    <input
                      type="text"
                      id="authors"
                      name="authors"
                      value={selectedArticle.authors}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="journal">Journal:</label>
                    <input
                      type="text"
                      id="journal"
                      name="journal"
                      value={selectedArticle.journal}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="publicationYear">Publication Year:</label>
                    <input
                      type="number"
                      id="publicationYear"
                      name="publicationYear"
                      value={selectedArticle.publicationYear}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="link">External Link (Optional):</label>
                    <input
                      type="url"
                      id="link"
                      name="link"
                      value={selectedArticle.link || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      name="description"
                      value={selectedArticle.description}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="action-button approve"
                      disabled={uploadStatus === "uploading"}
                    >
                      {uploadStatus === "uploading" ? "Updating..." : "Update Article"}
                    </button>

                    <button 
                      type="button" 
                      className="action-button delete"
                      onClick={handleDeleteArticle}
                    >
                      Delete Article
                    </button>

                    <button 
                      type="button" 
                      className="action-button cancel"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="article-form">
                <h2>Add New Article</h2>
                <form onSubmit={handleAddArticle}>
                  <div className="input-container">
                    <label htmlFor="title">Title:</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newArticle.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="DOI">DOI:</label>
                    <input
                      type="text"
                      id="DOI"
                      name="DOI"
                      value={newArticle.DOI}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="authors">Authors:</label>
                    <input
                      type="text"
                      id="authors"
                      name="authors"
                      value={newArticle.authors}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="journal">Journal:</label>
                    <input
                      type="text"
                      id="journal"
                      name="journal"
                      value={newArticle.journal}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="publicationYear">Publication Year:</label>
                    <input
                      type="number"
                      id="publicationYear"
                      name="publicationYear"
                      value={newArticle.publicationYear}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="link">External Link (Optional):</label>
                    <input
                      type="url"
                      id="link"
                      name="link"
                      value={newArticle.link}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="input-container">
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      name="description"
                      value={newArticle.description}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>

                  <div className="input-container">
                    <label htmlFor="file">PDF File:</label>
                    <input
                      type="file"
                      id="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="action-button approve"
                      disabled={uploadStatus === "uploading"}
                    >
                      {uploadStatus === "uploading" ? "Uploading..." : "Add Article"}
                    </button>

                    <button 
                      type="button" 
                      className="action-button cancel"
                      onClick={resetForm}
                    >
                      Reset Form
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleManagement;
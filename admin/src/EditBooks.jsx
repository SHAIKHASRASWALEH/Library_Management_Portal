import { useState } from "react";
import axios from "axios";

const [editingBook, setEditingBook] = useState(null);
const [editFormData, setEditFormData] = useState({
  title: "",
  author: "",
  subject: "",
  coSubject: "",
  total_copies: "",
  available_copies: "",
  description: "",
  coverImage: ""
});

// Handle input changes in the form
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setEditFormData((prevData) => ({
    ...prevData,
    [name]: value
  }));
};

// Fetch book details and open edit modal
const handleEditBook = async (bookId) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}books/get-book/${bookId}`, { withCredentials: true });
    const book = response.data.data;

    setEditFormData({
      title: book.title || "",
      author: book.author || "",
      subject: book.subject || "",
      coSubject: book.coSubject || "",
      total_copies: book.total_copies || "",
      available_copies: book.available_copies || "",
      description: book.description || "",
      coverImage: book.coverImage || ""
    });

    setEditingBook(bookId);
  } catch (error) {
    console.error("Error fetching book details:", error);
    alert("Failed to fetch book details.");
  }
};

// Handle form submission
const handleUpdateBook = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}books/${editingBook}`, editFormData, { withCredentials: true });

    if (!response.data.success) {
      throw new Error("Failed to update the book.");
    }

    alert("Book updated successfully!");

    // Refresh book list
    const updatedBooks = await axios.get(`${import.meta.env.VITE_API_BASE_URL}books/get-all-books`, { withCredentials: true });
    setBooks(updatedBooks.data.data);

    setEditingBook(null); // Close modal after updating
  } catch (error) {
    console.error("Error updating book:", error);
    alert("There was an error updating the book.");
  }
};

// Close edit modal
const handleCloseEditModal = () => {
  setEditingBook(null);
};

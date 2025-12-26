import { useState, useEffect } from "react";
import axios from "axios";

const AddEditBookForm = ({ bookId, onClose, onUpdate }) => {
    const [bookData, setBookData] = useState({
        title: "",
        author: "",
        subject: "",
        coSubject: "",
        total_copies: "",
        available_copies: "",
        description: "",
        coverImage: ""
    });

    useEffect(() => {
        if (bookId) {
            // Fetch existing book details for editing
            const fetchBook = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}books/get-book/${bookId}`, {
                        withCredentials: true
                    });
                    setBookData(response.data);
                } catch (error) {
                    console.error("Error fetching book:", error);
                }
            };
            fetchBook();
        }
    }, [bookId]);

    const handleChange = (e) => {
        setBookData({ ...bookData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (bookId) {
                // Edit existing book
                await axios.patch(`${import.meta.env.VITE_API_BASE_URL}books/${bookId}`, bookData, { withCredentials: true });
                alert("Book updated successfully!");
            } else {
                // Add new book
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}books/`, bookData, { withCredentials: true });
                if (response.data.statusCode !== 201 && response.data.statusCode !== 200) {
                    throw new Error("Failed to add the book.");
                }
                alert("Book added successfully!");
            }

            onUpdate(); // Refresh book list
            onClose();  // Close the modal
        } catch (error) {
            console.error("Error saving book:", error);
            alert("There was an error saving the book.");
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>{bookId ? "Edit Book" : "Add Book"}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="title" value={bookData.title} onChange={handleChange} placeholder="Enter book title" required />
                    <input type="text" name="author" value={bookData.author} onChange={handleChange} placeholder="Enter author" required />
                    <input type="text" name="subject" value={bookData.subject} onChange={handleChange} placeholder="Enter subject" required />
                    <input type="text" name="coSubject" value={bookData.coSubject} onChange={handleChange} placeholder="Enter co-subject" />
                    <input type="number" name="total_copies" value={bookData.total_copies} onChange={handleChange} placeholder="Enter total copies" required />
                    <input type="number" name="available_copies" value={bookData.available_copies} onChange={handleChange} placeholder="Enter available copies" required />
                    <textarea name="description" value={bookData.description} onChange={handleChange} placeholder="Enter book description"></textarea>
                    <input type="text" name="coverImage" value={bookData.coverImage} onChange={handleChange} placeholder="Enter image URL" />

                    <button type="submit">{bookId ? "Update Book" : "Add Book"}</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default AddEditBookForm;

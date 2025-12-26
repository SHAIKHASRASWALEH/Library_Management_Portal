import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Book } from "../models/book.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import imageDownloader from 'image-downloader';
import { BookIssue } from "../models/bookIssue.model.js";
import { Rating } from "../models/rating.model.js";
import { Student } from "../models/student.model.js";

const getBooks = asyncHandler(async(req, res) => {
    const books = await Book.find()
    return res.status(200).json(
        new ApiResponse(200, books, "Books fetched successfully")
    )
});

const getBook = asyncHandler(async(req, res) => {
    const book = await Book.findById(req.params.id)
    if (!book) {
        throw new ApiError(404, "Book not found")
    }
    return res.status(200).json(
        new ApiResponse(200, book, "Book fetched successfully")
    )
});

const addBook = asyncHandler(async(req, res) => {
    const { title, author, subject, coSubject, description, available_copies, total_copies, coverImageLink } = req.body
    let coverImage = req.body.coverImage

    if (
        [title, author, subject, coSubject, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    if(available_copies === undefined || total_copies === undefined){
        throw new ApiError(400, "All fields are required")
    }

    if(available_copies > total_copies){
        throw new ApiError(400, "Available copies cannot be greater than total copies")
    }

    if(req.file === undefined && coverImageLink === undefined && coverImage === undefined){
        throw new ApiError(400, "Cover image is required")
    }

    if(req.file){
        const { path } = req.file
        coverImage = await uploadOnCloudinary(path)
        coverImage = coverImage.secure_url
    }

    if(coverImageLink){
        const newName = 'photo' + Date.now() + '.jpg';
        try {
            await imageDownloader.image({
                url: coverImageLink,
                dest: '/tmp/' +newName,
            });
            coverImage = await uploadOnCloudinary('/tmp/' +newName);
            coverImage = coverImage.secure_url
        } catch (error) {
            throw new ApiError(500, "Error uploading cover image")
        }
    }

    const book = await Book.create({
        title, author, subject, coSubject, description, available_copies, total_copies, coverImage
    })

    const createdBook = await Book.findById(book._id)
    if (!createdBook) {
        throw new ApiError(500, "Something went wrong while creating the book")
    }

    return res.status(201).json(
        new ApiResponse(200, createdBook, "Book created Successfully")
    )
});

const addMultipleBooks = asyncHandler(async(req, res) => {
    const books = req.body.books;
    for (let i=0;i<books.length;i++) {
        const { title, author, subject, coSubject, description, available_copies, total_copies, coverImage } = books[i];
    
        if (
            [title, author, subject, coSubject, description].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }
    
        if(available_copies === undefined || total_copies === undefined){
            throw new ApiError(400, "All fields are required")
        }
    
        if(available_copies > total_copies){
            throw new ApiError(400, "Available copies cannot be greater than total copies")
        }
    
        const book = await Book.create({
            title, author, subject, coSubject, description, available_copies, total_copies, coverImage
        })
    
        const createdBook = await Book.findById(book._id)
        if (!createdBook) {
            throw new ApiError(500, "Something went wrong while creating the book")
        }
    }
    
    return res.status(201).json(
        new ApiResponse(200, {}, "Books created Successfully")
    )
});

const updateBook = asyncHandler(async(req, res) => {

    const book = await Book.findById(req.params.id)
    if (!book) {
        throw new ApiError(404, "Book not found")
    }

    const { title, author, subject, coSubject, description, available_copies, total_copies, coverImageLink } = req.body
    let coverImage = req.body.coverImage

    if (
        [title, author, subject, coSubject, description, available_copies, total_copies, coverImage, coverImageLink].every((field) => field === undefined)
    ) {
        throw new ApiError(400, "Atleast provide one field")
    }

    if(req.file){
        const { path } = req.file
        coverImage = await uploadOnCloudinary(path)
        coverImage = coverImage.secure_url
    }

    if(coverImageLink){
        const newName = 'photo' + Date.now() + '.jpg';
        try {
            await imageDownloader.image({
                url: coverImageLink,
                dest: '/tmp/' +newName,
            });
            coverImage = await uploadOnCloudinary('/tmp/' +newName);
            coverImage = coverImage.secure_url
        } catch (error) {
            throw new ApiError(500, "Error uploading cover image")
        }
    }

    if(coverImage){
        book.coverImage = coverImage
    }

    if(title){
        book.title = title
    }
    if(author){
        book.author = author
    }
    if(subject){
        book.subject = subject
    }
    if(coSubject){
        book.coSubject = coSubject
    }
    if(description){
        book.description = description
    }
    if(available_copies && total_copies){
        if(available_copies > total_copies){
            throw new ApiError(400, "Available copies cannot be greater than total copies")
        }
        book.available_copies = available_copies
        book.total_copies = total_copies
    }
    if(total_copies){
        if(book.available_copies > total_copies){
            throw new ApiError(400, "Available copies cannot be greater than total copies")
        }
        book.total_copies = total_copies
    }
    if(available_copies){
        if(available_copies > book.total_copies){
            throw new ApiError(400, "Available copies cannot be greater than total copies")
        }
        book.available_copies = available_copies
    }

    await book.save()

    return res.status(200).json(
        new ApiResponse(200, book, "Book updated successfully")
    )

});


const deleteBook = asyncHandler(async(req, res) => {
    const book = await Book.findById(req.params.id)
    if (!book) {
        throw new ApiError(404, "Book not found")
    }
    const bookings = await BookIssue.find({ bookId: req.params.id, status: 'issued' });
    if(bookings.length > 0){
        throw new ApiError(400, "Book is issued to some students. Cannot delete")
    }
    const session = await Book.startSession()
    session.startTransaction()

    try{
        await Rating.deleteMany({bookId: book._id}).session(session);

        const bookedBooks = await BookIssue.find({ bookId: req.params.id, status: 'booked' });
        for (let i = 0; i < bookedBooks.length; i++) {
            const studentId = bookedBooks[i].studentId;
            const student = await Student.findById(studentId);
            if(!student){
                throw new ApiError(404, "Student not found")
            }
            student.booksIssued -= 1;
            await student.save({session});
        }

        await BookIssue.deleteMany({bookId: book._id}).session(session);

        await book.deleteOne({ _id: req.params.id }).session(session);
        await session.commitTransaction();
        return res.status(200).json(
            new ApiResponse(200, book, "Book deleted successfully")
        )
    } 
    catch (error) {
        await session.abortTransaction()
        throw new ApiError(500, "Internal Server Error")
    } 
    finally {
        session.endSession()
    }
    
});

const searchBooks = asyncHandler(async(req, res) => {
    const { title, author, subject, coSubject } = req.query

    let searchQuery = {}

    if (title) searchQuery.title = { $regex: title, $options: 'i' }
    if (author) searchQuery.author = { $regex: author, $options: 'i' }
    if (subject) searchQuery.subject = { $regex: subject, $options: 'i' }
    if (coSubject) searchQuery.coSubject = { $regex: coSubject, $options: 'i' }

    const books = await Book.find(searchQuery)

    return res.status(200).json(
        new ApiResponse(200, books, "Books fetched successfully")
    )
});

export { 
    getBooks,
    getBook, 
    addBook, 
    updateBook,
    deleteBook,
    searchBooks,
    addMultipleBooks
}

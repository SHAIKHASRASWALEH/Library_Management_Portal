import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Rating } from "../models/rating.model.js"
import { Book } from "../models/book.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose"

const addOrUpdateRating = asyncHandler(async (req, res) => {
    const { rating, bookId } = req.body
    const student = req.student

    if (!student) {
        throw new ApiError(404, "Student not found")
    }

    const studentId = student._id

    if (
        [rating, bookId, studentId].some((field) => field == undefined)
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const book = await Book.findById(bookId)
    if (!book) {
        throw new ApiError(404, "Book not found")
    }

    if (rating < 0 || rating > 5) {
        throw new ApiError(400, "Invalid rating")
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try{

        let updatedRating;
        const existingRating = await Rating.findOne({ bookId: bookId, studentId: studentId })
        if (existingRating) {
            const newRating = (book.rating * book.numberOfRatings - existingRating.rating + rating) / (book.numberOfRatings)
            const updated = await Book.findByIdAndUpdate(bookId, {
                rating: newRating,
            }, { new: true }).session(session)
            existingRating.rating = rating
            await existingRating.save({ session })
            updatedRating = existingRating
        }
        else{
            const newRating = await Rating.create([{
                rating, bookId: bookId, studentId: studentId
            }], { session })
            updatedRating = newRating[0]
            if (book.numberOfRatings === 0) {
                const updated = await Book.findByIdAndUpdate(bookId, {
                    rating: rating,
                    numberOfRatings: 1
                }, { new: true }).session(session)
            }
            else {
                const newRating = (book.rating * book.numberOfRatings + rating) / (book.numberOfRatings + 1)
                const updated = await Book.findByIdAndUpdate(bookId, {
                    rating: newRating,
                    numberOfRatings: book.numberOfRatings + 1
                }, { new: true }).session(session)
            }
        }

        await session.commitTransaction()
    
        return res.status(201).json(
            new ApiResponse(200, updatedRating, "Rating added successfully")
        )
    } catch (error) {
        await session.abortTransaction()
        console.log(error)
        throw new ApiError(500, "Internal Server Error")
    } finally {
        session.endSession()
    }
    
});

const deleteRating = asyncHandler(async (req, res) => {
    const { bookId } = req.body
    const student = req.student

    if (!student) {
        throw new ApiError(404, "Student not found")
    }

    const studentId = student._id

    if (
        [bookId, studentId].some((field) => field == undefined)
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const book = await Book.findById(bookId)
    if (!book) {
        throw new ApiError(404, "Book not found")
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try{

        const existingRating = await Rating.findOne({ bookId: bookId, studentId: studentId })
        if (!existingRating) {
            throw new ApiError(404, "Rating not found")
        }
        const rating = existingRating.rating
        await Rating.deleteOne({ bookId: bookId, studentId: studentId }).session(session)
        let newRating;
        if(book.numberOfRatings === 1){
            newRating = 0
        }
        else newRating = (book.rating * book.numberOfRatings - rating) / (book.numberOfRatings - 1)
        const updated = await Book.findByIdAndUpdate(bookId, {
            rating: newRating,
            numberOfRatings: book.numberOfRatings - 1
        }, { new: true }).session(session)

        await session.commitTransaction()
    
        return res.status(200).json(
            new ApiResponse(200, {}, "Rating deleted successfully")
        )
    } catch (error) {
        await session.abortTransaction()
        console.log(error)
        throw new ApiError(500, "Internal Server Error")
    } finally {
        session.endSession()
    }

});

const getRating = asyncHandler(async (req, res) => {
    const { bookId } = req.params
    const student = req.student

    if (!student) {
        throw new ApiError(404, "Student not found")
    }

    const studentId = student._id

    if (
        [bookId, studentId].some((field) => field == undefined)
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const book = await Book.findById(bookId)

    if (!book) {
        throw new ApiError(404, "Book not found")
    }

    const rating = await Rating.findOne({ bookId: bookId, studentId: studentId })
    if (!rating) {
        throw new ApiError(404, "Rating not found")
    }

    return res.status(200).json(
        new ApiResponse(200, rating, "Rating fetched successfully")
    )

});

export { addOrUpdateRating, deleteRating, getRating }
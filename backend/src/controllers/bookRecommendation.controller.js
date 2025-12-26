import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BookRecommendation } from "../models/bookRecommendation.model.js";

const getBookRecommendations = asyncHandler(async (req, res, next) => {
    const bookRecommendations = await BookRecommendation.find();
    res.json(new ApiResponse( 200, bookRecommendations, "Book recommendations fetched successfully" ));
});

const getBookRecommendation = asyncHandler(async (req, res, next) => {
    const bookRecommendation = await BookRecommendation.findById(req.params.id);
    if (!bookRecommendation) {
        return next(new ApiError(404, "Book recommendation not found"));
    }
    res.json(new ApiResponse(200, bookRecommendation, "Book recommendation fetched successfully"));
});

const getBookRecommendationsForStudent = asyncHandler(async (req, res, next) => {

    const student = req.student;

    if(!student){
        return next(new ApiError(401, "Unauthorized"));
    }

    const bookRecommendations = await BookRecommendation.find({studentId: student._id});

    res.json(new ApiResponse(200, bookRecommendations, "Book recommendations fetched successfully"));
});

const createBookRecommendation = asyncHandler(async (req, res, next) => {
    const { title, author, edition, subject, comments } = req.body;

    const student = req.student;
    if (!student) {
        return next(new ApiError(401, "Unauthorized"));
    }

    if (!title || !author || !edition || !subject) {
        return next(new ApiError(400, "All fields are required"));
    }

    const bookRecommendation = await BookRecommendation.create({ title, author, edition, subject, comments, studentId: student._id });
    res.status(201).json(new ApiResponse(201, bookRecommendation, "Book recommendation created successfully"));
});

const approveBookRecommendation = asyncHandler(async (req, res, next) => {
    const bookRecommendation = await BookRecommendation.findById(req.body.id);
    if (!bookRecommendation) {
        return next(new ApiError(404, "Book recommendation not found"));
    }
    bookRecommendation.isApproved = true;
    await bookRecommendation.save();
    res.json(new ApiResponse(200, bookRecommendation, "Book recommendation approved successfully"));
});

const deleteBookRecommendation = asyncHandler(async (req, res, next) => {
    const bookRecommendation = await BookRecommendation.findById(req.params.id);
    if (!bookRecommendation) {
        return next(new ApiError(404, "Book recommendation not found"));
    }
    await bookRecommendation.deleteOne();
    res.json(new ApiResponse(200, {}, "Book recommendation deleted successfully"));
});


export { getBookRecommendations, getBookRecommendation, getBookRecommendationsForStudent, createBookRecommendation, approveBookRecommendation, deleteBookRecommendation };
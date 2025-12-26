import { Announcement } from '../models/announcement.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const getAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find().sort({ updatedAt: -1 });
    if (!announcements) {
        throw new ApiError(404, "Announcements not found")
    }
    return res.status(200).json(
        new ApiResponse(200, announcements, "Announcements fetched successfully")
    )
});

const getAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
        throw new ApiError(404, "Announcement not found")
    }
    return res.status(200).json(
        new ApiResponse(200, announcement, "Announcement fetched successfully")
    )
});

const addAnnouncement = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const { path } = req.file;
    //const image = await uploadOnCloudinary(path);
    const imageLink = "/uploads/"+path.split('/').slice(2).join('/');

    if (!title || !description || !imageLink) {
        throw new ApiError(400, "All fields are required")
    }

    const announcement = await Announcement.create({ title, description, imageLink });

    if (!announcement) {
        throw new ApiError(500, "Announcement not created")
    }

    return res.status(201).json(
        new ApiResponse(201, announcement, "Announcement created successfully")
    )
});

const updateAnnouncement = asyncHandler(async (req, res) => {
    const { title, description, id } = req.body;

    let imageLink = null;

    if(req.file){
        const { path } = req.file;
        //const image = await uploadOnCloudinary(path);
        imageLink = "/uploads/"+path.split('/').slice(2).join('/');
    }

    if (!title && !description && !imageLink) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
        throw new ApiError(404, "Announcement not found")
    }

    if(title){
        announcement.title = title;
    }
    if(description){
        announcement.description = description;
    }
    if(imageLink){
        announcement.imageLink = imageLink;
    }
    
    await announcement.save();

    return res.status(200).json(
        new ApiResponse(200, announcement, "Announcement updated successfully")
    )
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
        throw new ApiError(404, "Announcement not found")
    }

    return res.status(200).json(
        new ApiResponse(200, announcement, "Announcement deleted successfully")
    )
});

const getRecentAnnouncements = asyncHandler(async (req, res) => {
    const numberofAnnouncements = req.query.number || 5;
    const totalAnnouncements = await Announcement.countDocuments();
    if(isNaN(numberofAnnouncements)){
        throw new ApiError(400, "Invalid number of announcements");
    }
    if(numberofAnnouncements < 1){
        throw new ApiError(400, "Number of announcements should be greater than 0");
    }
    if(numberofAnnouncements > totalAnnouncements){
        throw new ApiError(400, "Number of announcements should be less than total announcements");
    }
    const announcements = await Announcement.find().sort({ updatedAt: -1 }).limit(5);
    return res.status(200).json(
        new ApiResponse(200, announcements, "Recent announcements fetched successfully")
    )
});

export { getAnnouncements, getAnnouncement, addAnnouncement, updateAnnouncement, deleteAnnouncement, getRecentAnnouncements };

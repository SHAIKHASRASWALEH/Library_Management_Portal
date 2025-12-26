import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { Complaint } from "../models/complaint.model.js";
import { Student } from "../models/student.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import transporter from "../utils/email.js";
import { complaintMailHTML, feedbackMailHTML, resolvedComplaintMailHTML, resolvedFeedbackMailHTML, complaintMailAdminHTML, feedbackMailAdminHTML, resolvedComplaintMailAdminHTML, resolvedFeedbackMailAdminHTML } from "../utils/mails.js";

const getComplaintsAndFeedbacks = asyncHandler(async(req, res) => {
    const complaints = await Complaint.find().populate('studentId','name rollNo').sort({status: 1});
    return res.status(200).json(
        new ApiResponse(200, complaints, "Complaints and Feedbacks fetched successfully")
    )
});

const getComplaintOrFeedback = asyncHandler(async(req, res) => {
    const complaint = await Complaint.findById(req.params.id).populate('studentId', 'name rollNo');
    if (!complaint) {
        throw new ApiError(404, "Complaint or Feedback not found")
    }
    return res.status(200).json(
        new ApiResponse(200, complaint, "Complaint or Feedback fetched successfully")
    )
});

const getComplaints = asyncHandler(async(req, res) => {
    const complaints = await Complaint.find({category: 'Complaint'}).populate('studentId','name rollNo').sort({status: 1});
    return res.status(200).json(
        new ApiResponse(200, complaints, "Complaints fetched successfully")
    )
});

const getFeedbacks = asyncHandler(async(req, res) => {
    const complaints = await Complaint.find({category: 'Feedback'}).populate('studentId','name rollNo').sort({status: 1});
    return res.status(200).json(
        new ApiResponse(200, complaints, "Feedbacks fetched successfully")
    )
});

const addComplaint = asyncHandler(async(req, res) => {
    const { category, title, description } = req.body;
    let attachments = [];

    if (!title || !description || !category) {
        throw new ApiError(400, "All fields are required")
    }

    if(req.files){
        for(let i = 0; i < req.files.length; i++){
            const { path } = req.files[i];
            //const image = await uploadOnCloudinary(path)
            attachments.push("/uploads/"+path.split('/').slice(2).join('/'));
        }
    }

    const student = await Student.findById(req.student._id);
    const complaint = await Complaint.create({ category, title, description, studentId: student._id, attachments });

    if (!complaint) {
        throw new ApiError(500, "Error while adding complaint/Feedback")
    }

    res.status(201).json(
        new ApiResponse(201, complaint, "Complaint/Feedback added successfully")
    );

    if(category == 'Complaint'){
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: "New Grievance raised",
            html: complaintMailHTML(student.name, complaint.title)
        };
        try{
            await transporter.sendMail(mailOptions);
        }
        catch(err){
            console.log(err);
        }

	const mailOptionsAdmin = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "New Grievance received",
            html: complaintMailAdminHTML(student.name, student.rollNo, complaint.title)
        };
        try{
            await transporter.sendMail(mailOptionsAdmin);
        }
        catch(err){
            console.log(err);
        }
    }
    else if(category == 'Feedback'){
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: "Regarding your feedback to the library",
            html: feedbackMailHTML(student.name, complaint.title)
        };
        try{
            await transporter.sendMail(mailOptions);
        }
        catch(err){
            console.log(err);
        }

	const mailOptionsAdmin = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "New Feedback raised",
            html: feedbackMailAdminHTML(student.name, student.rollNo, complaint.title)
        };
        try{
            await transporter.sendMail(mailOptionsAdmin);
        }
        catch(err){
            console.log(err);
        }
    }

    return;

});

const updateComplaint = asyncHandler(async(req, res) => {
    const status = req.body.status;

    const comment = {
        adminId: req.admin._id,
        comment: req.body.comment
    }

    if (!comment && !status) {
        throw new ApiError(400, "Either update the status or add a comment");
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        throw new ApiError(404, "Complaint/Feedback not found")
    }

    if (status) {
        complaint.status = status;
        if(status == 'resolved'){
            complaint.resolvedAt = new Date();
        }
    }

    if (comment) {
        complaint.comments.push(comment);
    }

    await complaint.save();

    res.status(200).json(
        new ApiResponse(200, complaint, "Complaint/Feedback updated successfully")
    )

    if(status == 'resolved'){
        const student = await Student.findById(complaint.studentId);
        if(complaint.category == 'Complaint'){
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: "Your grievance has been resolved",
                html: resolvedComplaintMailHTML(student.name, complaint.title)
            };
            try{
                await transporter.sendMail(mailOptions);
            }
            catch(err){
                console.log(err);
            }

	    const mailOptionsAdmin = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: "Grievance resolved",
                html: resolvedComplaintMailAdminHTML(student.name, student.rollNo, complaint.title)
            };
            try{
                await transporter.sendMail(mailOptionsAdmin);
            }
            catch(err){
                console.log(err);
            }
        }
        else if(complaint.category == 'Feedback'){
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: "Your feedback has been resolved",
                html: resolvedFeedbackMailHTML(student.name, complaint.title)
            };
            try{
                await transporter.sendMail(mailOptions);
            }
            catch(err){
                console.log(err);
            }

	    const mailOptionsAdmin = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: "Feedback resolved",
                html: resolvedFeedbackMailAdminHTML(student.name, student.rollNo, complaint.title)
            };
            try{
                await transporter.sendMail(mailOptionsAdmin);
            }
            catch(err){
                console.log(err);
            }
        }
    }
    
    return;
});

const deleteComplaint = asyncHandler(async(req, res) => {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
        throw new ApiError(404, "Complaint/Feedback not found")
    }

    await complaint.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Complaint deleted successfully")
    )
});

export {
    getComplaints,
    getComplaintsAndFeedbacks,
    getComplaintOrFeedback,
    getFeedbacks,
    addComplaint,
    updateComplaint,
    deleteComplaint
}

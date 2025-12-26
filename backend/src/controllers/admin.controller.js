import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Admin} from "../models/admin.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import {resetPasswordMailHTML, approvedRegistrationMailHTML, rejectedRegistrationMailHTML} from "../utils/mails.js";
import transporter from "../utils/email.js";
import { Student } from "../models/student.model.js";
import { BookIssue } from "../models/bookIssue.model.js";
import { Book } from "../models/book.model.js";
import { SeatBooking } from "../models/seatBooking.model.js";
import mongoose from "mongoose";
import { Rating } from "../models/rating.model.js";


const generateAccessAndRefereshTokens = async (adminId) =>{
    try {
        const admin = await Admin.findById(adminId)
        const accessToken = admin.generateAccessToken()
        const refreshToken = admin.generateRefreshToken()

        admin.refreshToken = refreshToken
        await admin.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

// const registerAdmin = asyncHandler( async (req, res) => {

//     const { username, email, password } = req.body

//     if (
//         [username, email, password].some((field) => field?.trim() === "")
//     ) {
//         throw new ApiError(400, "All fields are required")
//     }

//     const existedAdmin = await Admin.findOne({
//         $or: [{ email }]
//     })

//     if (existedAdmin) {
//         throw new ApiError(409, "Admin with email or rollNo already exists")
//     }

//     const admin = await Admin.create({
//         username, email, password
//     })

//     const createdAdmin = await Admin.findById(admin._id).select(
//         "-password -refreshToken"
//     )

//     if (!createdAdmin) {
//         throw new ApiError(500, "Something went wrong while registering the admin")
//     }

//     return res.status(201).json(
//         new ApiResponse(200, createdAdmin, "Admin registered Successfully")
//     )

// });

const resetPasswordRequest = asyncHandler(async(req, res) => {
    const { email } = req.body
    const admin = await Admin.findOne({
        email: email
    })

    if (!admin) {
        throw new ApiError(404, "Admin does not exist")
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset password for your library account',
        html: resetPasswordMailHTML(admin.email, admin.username)
    };

    try{
        await transporter.sendMail(mailOptions)
        return res.status(200).json({ message: 'Reset password mail sent successfully' });
    }
    catch(error){
        throw new ApiError(500, error.message || 'Error sending reset password mail');
    }

});

const resetPassword = asyncHandler(async(req, res) => {
    const { token, password } = req.body
    try {   
        const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
        const { email } = decoded;

        const admin = await Admin.findOne({
            email: email
        })

        if (!admin) {
            throw new ApiError(404, "Admin does not exist")
        }

        admin.password = password
        await admin.save({validateBeforeSave: false})

        return res.status(200).json(
            new ApiResponse(200, {}, "Password reset successfully")
        )

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || 'Invalid or expired token');
    }

});

const loginAdmin = asyncHandler(async (req, res) =>{

    const { email, password } = req.body
    console.log(email);

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const admin = await Admin.findOne({
        email: email
    })

    if (!admin) {
        throw new ApiError(404, "Admin does not exist")
    }

    const isPasswordValid = await admin.isPasswordCorrect(password)

   if (!isPasswordValid) {
       throw new ApiError(401, "Invalid admin credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(admin._id)

    const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        sameSite: "none",
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                admin: loggedInAdmin, accessToken, refreshToken
            },
            "Admin logged In Successfully"
        )
    )

})

const logoutAdmin = asyncHandler(async(req, res) => {
    await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        sameSite: "none",
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const admin = await Admin.findById(decodedToken?._id)
    
        if (!admin) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== admin?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            sameSite: "none",
            secure: true
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(admin._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body
    const admin = await Admin.findById(req.admin?._id)
    const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    admin.password = newPassword
    await admin.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
});

const getCurrentAdmin = asyncHandler(async(req, res) => {
    try{
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.admin,
            "Admin fetched successfully"
        ))
    }
    catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while fetching admin")
    }
    
});


const approveStudentRegistration = asyncHandler(async(req, res) => {

    const session = await Student.startSession()

        try {
            session.startTransaction()
            const { studentId } = req.body
            const student = await Student.findById(studentId)
            if (!student) {
                throw new ApiError(404, "Student does not exist")
            }
            student.isAdminApproved = true
            await student.save({validateBeforeSave: false, session}) 

            res.status(200).json(new ApiResponse(200, student, "Student registration approved successfully"))

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: 'Registration approved for your library account',
                html: approvedRegistrationMailHTML(student.name)
            };

            try{
                await transporter.sendMail(mailOptions)
            }
            catch(error){
                throw new ApiError(500, error.message || 'Error sending mail');
            }

            await session.commitTransaction()

            return;

        } catch (error) {   
            await session.abortTransaction()
            throw new ApiError(500, error.message || "Something went wrong while approving student registration")
        }
        finally {
            session.endSession()
        }
});

const rejectStudentRegistration = asyncHandler(async(req, res) => {

    const session = await Student.startSession()

    try {
        session.startTransaction()
        const { studentId } = req.params
        const student = await Student.findById(studentId)
        if (!student) {
            throw new ApiError(404, "Student does not exist")
        }
        const name = student.name
        await Student.deleteOne({_id: studentId}).session(session)

        res.status(200).json(new ApiResponse(200, {}, "Student registration rejected successfully"))

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Registration rejected for your library account',
            html: rejectedRegistrationMailHTML(name)
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            throw new ApiError(500, error.message || 'Error sending mail');
        }

        await session.commitTransaction()
        return;

    } catch (error) {   
        await session.abortTransaction()
        throw new ApiError(500, error.message || "Something went wrong while rejecting student registration")
    }
    finally {
        session.endSession()
    }

});

const getPendingStudentRegistrations = asyncHandler(async(req, res) => {
    const students = await Student.find({
        isAdminApproved: false
    })
    return res.status(200).json(new ApiResponse(200, students, "Pending student registrations fetched successfully"))
});

const getIssuedBooksByStudent = asyncHandler(async(req, res) => {
    const studentRollNo = req.params.rollNo.toLowerCase()
    const student = await Student.findOne({rollNo: studentRollNo})
    if (!student) {
        throw new ApiError(404, "Student not found")
    }
    const issuedBooks = await BookIssue.find({
        studentId: student._id,
    });
    return res.status(200).json(new ApiResponse(200, issuedBooks, "Issued books fetched successfully"))
});

const getIssuedBooksByBook = asyncHandler(async(req, res) => {
    const bookId = req.params.bookId
    const book = await Book.findById(bookId)
    if (!book) {
        throw new ApiError(404, "Book not found")
    }
    const issuedBooks = await BookIssue.find({
        bookId: book._id,
    });
    return res.status(200).json(new ApiResponse(200, issuedBooks, "Issued books fetched successfully"))
});

const removeStudent = asyncHandler(async(req, res) => {
    const studentRollNo = req.params.rollNo.toLowerCase();
    const student = await Student.findOne({rollNo: studentRollNo});
    if (!student) {
        throw new ApiError(404, "Student not found")
    }
    const studentId = student._id;
    const issuedBooks = await BookIssue.find({
        studentId: studentId,
        status: "issued"
    });

    if (issuedBooks.length > 0) {
        throw new ApiError(400, "Student has issued books. Cannot remove student")
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try{
        await SeatBooking.deleteMany({studentId: studentId}).session(session);

        const bookedBooks = await BookIssue.find({studentId: studentId, status: "booked"});
        for (let i = 0; i < bookedBooks.length; i++) {
            const bookId = bookedBooks[i].bookId;
            const book = await Book.findById(bookId);
            if (!book) {
                throw new ApiError(404, "Book not found")
            }
            book.available_copies += 1;
            await book.save({session});
            await BookIssue.deleteOne({bookId: bookId, studentId: studentId}).session(session)
        }

        const ratedBooks = await Rating.find({studentId: studentId});
        for (let i = 0; i < ratedBooks.length; i++) {
            const bookId = ratedBooks[i].bookId;
            const book = await Book.findById(bookId);
            if (!book) {
                throw new ApiError(404, "Book not found")
            }
            let newRating;
            if(book.numberOfRatings === 1){
                newRating = 0
            }
            else newRating = (book.rating * book.numberOfRatings - ratedBooks[i].rating) / (book.numberOfRatings - 1)
            const updated = await Book.findByIdAndUpdate(bookId, {
                rating: newRating,
                numberOfRatings: book.numberOfRatings - 1
            }, { new: true }).session(session)
            await Rating.deleteOne({ bookId: bookId, studentId: studentId }).session(session)
        }
        await Student.findByIdAndDelete(studentId).session(session);
        await session.commitTransaction();
        return res.status(200).json(new ApiResponse(200, {}, "Student removed successfully"))
    }
    catch (error) {
        await session.abortTransaction()
        throw new ApiError(500, error.message || "Something went wrong while removing student")
    }
    finally {
        session.endSession()
    }

});

const getStudentByRollNumber = asyncHandler(async(req, res) => {

    const student = await Student.findOne({rollNo: req.params.rollNo}).select("-password -refreshToken");
    if(!student){
        throw new ApiError(404, "Student not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            student,
            "Student details fetched successfully"
        ));
});


export {
    //registerAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentAdmin,
    resetPasswordRequest,
    resetPassword,
    approveStudentRegistration,
    rejectStudentRegistration,
    getPendingStudentRegistrations,
    getIssuedBooksByStudent,
    getIssuedBooksByBook,
    removeStudent,
    getStudentByRollNumber
}
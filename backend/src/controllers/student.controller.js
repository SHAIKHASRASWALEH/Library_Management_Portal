import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Student } from "../models/student.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import transporter from "../utils/email.js";
import { verificationMailHTML, resetPasswordMailHTML } from "../utils/mails.js";
import { BookIssue } from "../models/bookIssue.model.js";
import { Complaint } from "../models/complaint.model.js";

const generateAccessAndRefereshTokens = async (studentId) =>{
    try {
        const student = await Student.findById(studentId)
        const accessToken = student.generateAccessToken()
        const refreshToken = student.generateRefreshToken()

        student.refreshToken = refreshToken
        await student.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerStudent = asyncHandler( async (req, res) => {

    const { name, email, dateOfBirth, gender, phoneNumber, rollNo, department, degree, password } = req.body

    if (
        [name, email, dateOfBirth, gender, phoneNumber, rollNo, department, degree, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedStudent = await Student.findOne({
        $or: [{ rollNo }, { email }]
    })

    if (existedStudent) {
        throw new ApiError(409, "Student with email or rollNo already exists")
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verification mail for registering your library account',
        html: verificationMailHTML(name, email, dateOfBirth, gender, phoneNumber, rollNo, department, degree, password)
    };

    try{
        await transporter.sendMail(mailOptions)
    }
    catch(error){
        throw new ApiError(500, "Error sending verification mail")
    }

    return res.status(200).json({ message: 'Verification mail sent successfully' });

});

const verifyEmail = asyncHandler(async(req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
        const { name, email, dateOfBirth, gender, phoneNumber, rollNo, department, degree, password } = decoded;

        const student = await Student.create({
            name, email, dateOfBirth, gender, phoneNumber, rollNo, department, degree, password
        })
    
        const createdStudent = await Student.findById(student._id).select(
            "-password -refreshToken"
        )
    
        if (!createdStudent) {
            throw new ApiError(500, "Something went wrong while registering the student")
        }
    
        return res.status(201).json(
            new ApiResponse(200, createdStudent, "Student registered Successfully")
        )
    
    } catch (error) {
        res.status(400).send(error.message || 'Invalid or expired token');
    }

});

const resetPasswordRequest = asyncHandler(async(req, res) => {
    const { email } = req.body
    const student = await Student.findOne({
        email: email
    })

    if (!student) {
        throw new ApiError(404, "Student does not exist")
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset password for your library account',
        html: resetPasswordMailHTML(student.email, student.name)
    };

    try{
        await transporter.sendMail(mailOptions)
    }
    catch(error){
        throw new ApiError(500, "Error sending reset password mail")
    }

    return res.status(200).json({ message: 'Reset password mail sent successfully' });

});

const resetPassword = asyncHandler(async(req, res) => {
    const { token, password } = req.body
    try {   
        const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
        const { email } = decoded;

        const student = await Student.findOne({
            email: email
        })

        if (!student) {
            throw new ApiError(404, "Student does not exist")
        }

        student.password = password
        await student.save({validateBeforeSave: false})

        return res.status(200).json(
            new ApiResponse(200, {}, "Password reset successfully")
        )

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message || 'Invalid or expired token');
    }

});


const loginStudent = asyncHandler(async (req, res) =>{

    const { email, password } = req.body
    console.log(email);

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const student = await Student.findOne({
        email: email
    })

    if (!student) {
        throw new ApiError(404, "Student does not exist")
    }

    if(student.isAdminApproved === false){
        throw new ApiError(401, "Student registration is not approved yet")
    }

    const isPasswordValid = await student.isPasswordCorrect(password)

    if(!isPasswordValid) {
       throw new ApiError(401, "Invalid student credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(student._id)

    const loggedInStudent = await Student.findById(student._id).select("-password -refreshToken")

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
                student: loggedInStudent, accessToken, refreshToken
            },
            "Student logged In Successfully"
        )
    )

})

const logoutStudent = asyncHandler(async(req, res) => {
    await Student.findByIdAndUpdate(
        req.student._id,
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
        .json(new ApiResponse(200, {}, "Student logged Out"))
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
    
        const student = await Student.findById(decodedToken?._id)
    
        if (!student) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== student?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            SameSite: "None",
            secure: true
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(student._id)
    
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
    const student = await Student.findById(req.student?._id)
    const isPasswordCorrect = await student.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    student.password = newPassword
    await student.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
});

const getCurrentStudent = asyncHandler(async(req, res) => {

    const student = await Student.findById(req.student._id).select(
        "-password -refreshToken"
    )
    if (!student) {
        throw new ApiError(404, "Student not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.student,
        "Student fetched successfully"
    ))
});

const getIssuedBooks = asyncHandler(async(req, res) => {
    const student = req.student
    const issuedBooks = await BookIssue.find({
        studentId: student._id
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        issuedBooks,
        "Issued books fetched successfully"
    ));
});

const getCurrentStudentComplaints = asyncHandler(async(req, res) => {
    const student = req.student;
    const complaints = await Complaint.find({
        studentId: student._id
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        complaints,
        "Complaints fetched successfully"
    ));

});

const updateProfile = asyncHandler(async(req,res) => {

    const student = req.student;
    const { dateOfBirth, degree, department, gender, phoneNumber, password } = req.body;

    if(!student){
        throw new ApiError(404, "Student not found");
    }

    if(student.isAdminApproved){
        throw new ApiError(400, "Cannot change profile once submitted.");
    }

    if(dateOfBirth){
        student.dateOfBirth = dateOfBirth;
    }
    if(degree){
        student.degree = degree;
    }
    if(department){
        student.department = department;
    }
    if(gender){
        student.gender = gender;
    }
    if(phoneNumber) {
        if(!(/^\d{10}$/).test(phoneNumber)) {
            throw new ApiError(400, "Please enter a valid phone number");
        }
        student.phoneNumber = phoneNumber;
    }
    if(password){
        student.password = password;
    }

    if(dateOfBirth && degree && department && gender && phoneNumber && password){
        student.isAdminApproved = true;
    }

    await student.save();

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.student,
        "Student profile updated successfully"
    ));

});


export {
    registerStudent,
    verifyEmail,
    loginStudent,
    logoutStudent,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentStudent,
    resetPasswordRequest,
    resetPassword,
    getIssuedBooks,
    getCurrentStudentComplaints,
    updateProfile
}

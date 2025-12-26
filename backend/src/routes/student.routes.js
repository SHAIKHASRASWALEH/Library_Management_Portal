import { Router } from "express";
import { 
    loginStudent, 
    logoutStudent, 
    registerStudent, 
    verifyEmail,
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentStudent,
    resetPasswordRequest,
    resetPassword,
    getIssuedBooks,
    getCurrentStudentComplaints,
    updateProfile
} from "../controllers/student.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(registerStudent)
router.route("/verify-email").get(verifyEmail)
router.route("/login").post(loginStudent)
router.route("/logout").post(verifyJWT,  logoutStudent)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-student").get(verifyJWT, getCurrentStudent)
router.route("/reset-password").patch(resetPassword)
router.route("/reset-password-request").post(resetPasswordRequest)
router.route("/get-issued-books").get(verifyJWT, getIssuedBooks)
router.route("/get-my-complaints").get(verifyJWT, getCurrentStudentComplaints)
router.route("/update-profile").patch(verifyJWT, updateProfile);

export default router
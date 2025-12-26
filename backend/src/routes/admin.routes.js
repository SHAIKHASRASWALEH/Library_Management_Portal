import { Router } from "express";
import { 
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
} from "../controllers/admin.controller.js";
import { verifyJWTAdmin } from "../middlewares/auth.middleware.js";

const router = Router()

//router.route("/register").post(registerAdmin)
//router.route("/login").post(loginAdmin)
router.route("/logout").post(verifyJWTAdmin,  logoutAdmin)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWTAdmin, changeCurrentPassword)
router.route("/current-admin").get(verifyJWTAdmin, getCurrentAdmin)
router.route("/reset-password").patch(resetPassword)
router.route("/reset-password-request").post(resetPasswordRequest)
router.route("/approve-student-registration").patch(verifyJWTAdmin, approveStudentRegistration)
router.route("/reject-student-registration/:studentId").delete(verifyJWTAdmin, rejectStudentRegistration)
router.route("/pending-student-registration-requests").get(verifyJWTAdmin, getPendingStudentRegistrations)
router.route("/get-issued-books-by-student/:rollNo").get(verifyJWTAdmin, getIssuedBooksByStudent)
router.route("/get-issued-books-by-book/:bookId").get(verifyJWTAdmin, getIssuedBooksByBook)
router.route("/remove-student/:rollNo").delete(verifyJWTAdmin, removeStudent)
router.route("/get-student-by-rollNo/:rollNo").get(verifyJWTAdmin, getStudentByRollNumber)

export default router

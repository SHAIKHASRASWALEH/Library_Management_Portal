import { Router } from 'express';
import { Bookbooking, approveBookIssue, rejectBookIssue, returnBook, renewBook, cancelBooking, getAllBookIssues, getBookingById, getAllBookIssuesWithDetails, issueBook } from '../controllers/bookIssue.controller.js';
import { verifyJWTAdmin } from '../middlewares/auth.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

router.route("/get-all").get(verifyJWTAdmin, getAllBookIssues)
router.route("/get-all-details").get(verifyJWTAdmin, getAllBookIssuesWithDetails)
router.route("/get-booking-by-id/:id").get(verifyJWTAdmin, getBookingById)
router.route("/book-booking").post(verifyJWT, Bookbooking)
router.route("/approve-book-issue").patch(verifyJWTAdmin, approveBookIssue)
router.route("/reject-book-issue/:bookbookingId").delete(verifyJWTAdmin, rejectBookIssue)
router.route("/return-book").patch(verifyJWTAdmin, returnBook)
router.route("/renew-book").patch(verifyJWT, renewBook)
router.route("/cancel/:bookbookingId").delete(verifyJWT, cancelBooking)
router.route("/issue-book-from-library").patch(verifyJWT, issueBook)

export default router
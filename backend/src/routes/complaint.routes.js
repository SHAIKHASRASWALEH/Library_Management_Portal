import {Router} from 'express';
import {addComplaint, deleteComplaint, getFeedbacks, getComplaintOrFeedback, getComplaints, getComplaintsAndFeedbacks, updateComplaint} from '../controllers/complaint.controller.js';
import { verifyJWTAdmin } from '../middlewares/auth.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadMultiple } from '../middlewares/multer.middleware.js';

const router = Router();

router.route("/").get(verifyJWTAdmin, getComplaintsAndFeedbacks);
router.route("/").post(verifyJWT, uploadMultiple, addComplaint);
router.route("/get-by-id/:id").get(verifyJWT, getComplaintOrFeedback);
router.route("/:id").patch(verifyJWTAdmin, updateComplaint);
router.route("/:id").delete(verifyJWTAdmin, deleteComplaint);
router.route("/complaints").get(verifyJWTAdmin, getComplaints);
router.route("/feedbacks").get(verifyJWTAdmin, getFeedbacks);

export default router;
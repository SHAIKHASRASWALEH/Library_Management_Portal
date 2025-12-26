import { Router } from 'express';
import { verifyJWTAdmin } from '../middlewares/auth.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getAnnouncement, getAnnouncements, getRecentAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } from '../controllers/announcement.controller.js';
import { uploadFile } from '../middlewares/multer.middleware.js';

const router = Router()

router.route("/get-all").get(verifyJWT, getAnnouncements);
router.route("/get/:id").get(verifyJWT, getAnnouncement);
router.route("/get-recent").get(verifyJWT, getRecentAnnouncements);
router.route("/add").post(verifyJWTAdmin, uploadFile, addAnnouncement);
router.route("/update").patch(verifyJWTAdmin, uploadFile, updateAnnouncement);
router.route("/delete/:id").delete(verifyJWTAdmin, deleteAnnouncement);

export default router
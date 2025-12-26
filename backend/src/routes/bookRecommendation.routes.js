import { Router } from 'express';
import { verifyJWTAdmin } from '../middlewares/auth.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getBookRecommendation, getBookRecommendations, createBookRecommendation, approveBookRecommendation, deleteBookRecommendation, getBookRecommendationsForStudent } from '../controllers/bookRecommendation.controller.js';

const router = Router()

router.route("/get-all").get(verifyJWTAdmin, getBookRecommendations);
router.route("/get/:id").get(verifyJWTAdmin, getBookRecommendation);
router.route("/get-for-Student").get(verifyJWT, getBookRecommendationsForStudent);
router.route("/create").post(verifyJWT, createBookRecommendation);
router.route("/approve").patch(verifyJWTAdmin,approveBookRecommendation);
router.route("/delete/:id").delete(verifyJWTAdmin, deleteBookRecommendation);

export default router
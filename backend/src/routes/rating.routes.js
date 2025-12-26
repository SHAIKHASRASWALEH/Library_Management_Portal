import {Router} from 'express';
import {addOrUpdateRating, deleteRating, getRating} from '../controllers/rating.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

router.route("/").post(verifyJWT, addOrUpdateRating)
router.route("/").delete(verifyJWT, deleteRating)
router.route("/:bookId").get(verifyJWT, getRating)

export default router

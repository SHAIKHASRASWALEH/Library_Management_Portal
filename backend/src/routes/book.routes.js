import {Router} from 'express';
import {addBook, getBook, getBooks, updateBook, deleteBook, searchBooks, addMultipleBooks} from '../controllers/book.controller.js';
import {verifyJWTAdmin} from '../middlewares/auth.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router()

router.route("/get-all-books").get(verifyJWT, getBooks)
router.route("/get-book/:id").get(verifyJWT, getBook)
router.route("/").post(verifyJWTAdmin, upload, addBook)
router.route("/:id").patch(verifyJWTAdmin, upload, updateBook)
router.route("/:id").delete(verifyJWTAdmin, deleteBook)
router.route("/search").get(verifyJWT, searchBooks)
router.route("/add-multiple-books").post(verifyJWTAdmin, addMultipleBooks)

export default router

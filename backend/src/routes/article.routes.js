import {Router} from 'express';
import { getArticle, getArticles, addArticle, updateArticle, deleteArticle, getArticleByDOI } from '../controllers/article.controller.js';
import { verifyJWTAdmin } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../middlewares/multer.middleware.js';

const router = Router();

router.route("/get-all").get(verifyJWTAdmin, getArticles);
router.route("/add").post(verifyJWTAdmin, uploadFile, addArticle);
router.route("/get/:id").get(verifyJWTAdmin, getArticle);
router.route("/DOI/").get(verifyJWTAdmin, getArticleByDOI);
router.route("/update").patch(verifyJWTAdmin, updateArticle);
router.route("/delete/:id").delete(verifyJWTAdmin, deleteArticle);

export default router;
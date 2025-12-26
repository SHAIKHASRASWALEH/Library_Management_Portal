import { Router } from "express";
import {    getArticleSharings,
            getArticleSharing,
            getArticleSharingsByDOI,
            getArticleSharingsByStudent,
            requestArticle,
            approveArticleRequest,
            updateArticleRequest,
            rejectArticleRequest,
            deleteArticleRequest,
            viewArticle
        } from "../controllers/articleSharing.controller.js";
import { verifyJWTAdmin } from "../middlewares/auth.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/get").get(verifyJWTAdmin, getArticleSharings);
router.route("/get-by-id/:id").get(verifyJWTAdmin, getArticleSharing);
router.route("/doi/").get(verifyJWTAdmin, getArticleSharingsByDOI);
router.route("/student").get(verifyJWT, getArticleSharingsByStudent);
router.route("/request").post(verifyJWT, requestArticle);
router.route("/approve").patch(verifyJWTAdmin, approveArticleRequest);
router.route("/update").patch(verifyJWTAdmin, updateArticleRequest);
router.route("/reject").patch(verifyJWTAdmin, rejectArticleRequest);
router.route("/delete/:id").delete(verifyJWTAdmin, deleteArticleRequest);
router.route("/view/").get(verifyJWT, viewArticle);

export default router;
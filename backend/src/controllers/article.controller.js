import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { Article } from "../models/article.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getArticles = asyncHandler(async(req, res) => {
    const articles = await Article.find()
    return res.status(200).json(
        new ApiResponse(200, articles, "Articles fetched successfully")
    )
});

const getArticle = asyncHandler(async(req, res) => {
    const article = await Article.findById(req.params.id)
    if (!article) {
        throw new ApiError(404, "Article not found")
    }
    return res.status(200).json(
        new ApiResponse(200, article, "Article fetched successfully")
    )
});

const getArticleByDOI = asyncHandler(async(req, res) => {
    const DOI = req.query.DOI;
    const article = await Article.findOne({ DOI: DOI });
    if (!article) {
        throw new ApiError(404, "Article not found");
    }
    return res.status(200).json(
        new ApiResponse(200, article, "Article fetched successfully")
    );
});

const addArticle = asyncHandler(async(req, res) => {
    const { title, DOI, description, authors, journal, publicationYear } = req.body

    if(!title || !DOI || !description || !authors || !journal || !publicationYear){
        throw new ApiError(400, "All fields are required")
    }

    const existingArticle = await Article.findOne({ DOI: DOI });
    if(existingArticle) {
        throw new ApiError(409, "This article already exists");
    }

    const { path } = req.file;
    //const file_link = await uploadOnCloudinary(path);
    const link = process.env.STUDENT_URL+"/uploads/"+path.split('/').slice(2).join('/');

    const article = await Article.create({ title, DOI, description, link, authors, journal, publicationYear });

    if(!article){
        throw new ApiError(500, "Error while adding article")
    }

    return res.status(201).json(
        new ApiResponse(201, article, "Article added successfully")
    )
});

const updateArticle = asyncHandler(async(req, res) => {
    const { title, DOI, description, link, authors, journal, publicationYear } = req.body

    if(!title && !DOI && !description && !link && !authors && !journal && !publicationYear){
        throw new ApiError(400, "Some field is required");
    }

    const article = await Article.findById(req.body.id);

    if(!article){
        throw new ApiError(404, "Article not found")
    }

    if(title){
        article.title = title
    }
    if(DOI){
        article.DOI = DOI
    }
    if(description){
        article.description = description
    }
    if(link){
        article.link = link
    }
    if(authors){
        article.authors = authors
    }
    if(journal){
        article.journal = journal
    }
    if(publicationYear){
        article.publicationYear = publicationYear
    }
    

    await article.save();

    return res.status(200).json(
        new ApiResponse(200, article, "Article updated successfully")
    )
});

const deleteArticle = asyncHandler(async(req, res) => {
    const article = await Article.findById(req.params.id);
    if (!article) {
        throw new ApiError(404, "Article not found");
    }
    await article.deleteOne();
    return res.status(200).json(
        new ApiResponse(200, {}, "Article deleted successfully")
    )
});


export { getArticles, getArticle, getArticleByDOI, addArticle, updateArticle, deleteArticle }

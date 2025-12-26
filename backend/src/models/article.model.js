import mongoose, {Schema} from "mongoose";

const articleSchema = new mongoose.Schema(
    {
        DOI: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        authors: {
            type: String,
            required: true,
            trim: true
        },
        journal: {
            type: String,
            required: true,
            trim: true
        },
        publicationYear: {
            type: Number,
            required: true,
            trim: true
        },
        link: {
            type: String,
            required: true,
            trim: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

export const Article = mongoose.model("Article", articleSchema);
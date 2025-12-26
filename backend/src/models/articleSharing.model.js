import mongoose, {Schema} from "mongoose";

const articleSharingSchema = new mongoose.Schema(
    {
        DOI: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        authors: {
            type: String,
            trim: true
        },
        journal: {
            type: String,
            trim: true
        },
        publicationYear: {
            type: Number,
            trim: true
        },
        requestedAt: {
            type: Date,
            required: true
        },
        additionalInfo: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            required: true,
            enum: ['requested', 'shared', 'rejected'],
            default: 'requested'
        },
        sharedAt: {
            type: Date,
        },
        validTill: {
            type: Date,
        },
        link: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

export const ArticleSharing = mongoose.model("ArticleSharing", articleSharingSchema);
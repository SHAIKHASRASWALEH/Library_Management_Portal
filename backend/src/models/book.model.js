import mongoose,{Schema} from "mongoose";

const bookSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        author: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        subject:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        coSubject:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description:{
            type: String,
            required: true,
            trim: true,
        },
        available_copies:{
            type: Number,
            required: true,
        },
        total_copies:{
            type: Number,
            required: true,
        },
        coverImage:{
            type: String,
            required: true,
        },
        rating:{
            type: Number,
            default: 0,
            required: true,
        },
        numberOfRatings:{
            type: Number,
            default: 0,
            required: true,
        }
    },
    {
        timestamps: true
    }
);

export const Book = mongoose.model("Book", bookSchema);
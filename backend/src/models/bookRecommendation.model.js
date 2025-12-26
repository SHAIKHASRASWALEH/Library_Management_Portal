import mongoose,{Schema} from "mongoose";

const bookRecommendationSchema = new Schema(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Student"
        },
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
        edition:{
            type: String,
            required: true,
            trim: true
        },
        comments:{
            type: String,
            trim: true
        },
        isApproved:{
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const BookRecommendation = mongoose.model("BookRecommendation", bookRecommendationSchema);
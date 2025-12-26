import mongoose,{Schema} from "mongoose";

const ratingSchema = new Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true
        },
        rating: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Rating = mongoose.model("Rating", ratingSchema);
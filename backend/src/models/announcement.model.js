import mongoose,{Schema} from "mongoose";

const announcementSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        imageLink: {
            type: String,
            required: true,
            trim: true
        },
    },
    {
        timestamps: true
    }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
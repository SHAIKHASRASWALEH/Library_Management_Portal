import mongoose, {Schema} from "mongoose";

const pauseBookingSchema = new Schema({
    pauseReason: {
        type: String,
        required: true
    },
    pauseStartTime: {
        type: Date,
        required: true
    },
    pauseEndTime: {
        type: Date,
        required: true
    },
    room: {
        type: String,
        required: true
    }
});

export const PauseBooking = mongoose.model("PauseBooking", pauseBookingSchema);
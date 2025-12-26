import mongoose,{Schema} from "mongoose";

const seatBookingSchema = new Schema(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        seatId: {
            type: Schema.Types.ObjectId,
            ref: "Seat",
            required: true
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

seatBookingSchema.index({ seatId: 1, startTime: 1, endTime: 1 }, { unique: true });
seatBookingSchema.index({ studentId: 1, startTime: 1, endTime: 1 }, { unique: true });

export const SeatBooking = mongoose.model("seatBooking", seatBookingSchema);
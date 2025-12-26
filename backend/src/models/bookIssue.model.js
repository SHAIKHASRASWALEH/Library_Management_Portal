import mongoose,{Schema} from 'mongoose';

const bookIssueSchema = new Schema(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },
        bookId: {
            type: Schema.Types.ObjectId,
            ref: "Book",
            required: true,
            index: true
        },
        issueDate: {
            type: Date,
            required: true
        },
        returnDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['issued', 'returned', 'booked'],
            default: 'booked'
        },
        renewalCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export const BookIssue = mongoose.model("BookIssue", bookIssueSchema);
import mongoose, {Schema} from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true
        },
        category: {
            type: String,
            required: true,
            trim: true,
            index: true,
            enum: ['Complaint','Feedback']
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
        },
        attachments: [
            {
                type: String,
                required: true,
                trim: true
            }
        ],
        comments: [
            {
                adminId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Admin",
                    required: true,
                    index: true
                },
                comment: {
                    type: String,
                    required: true,
                    trim: true
                }
            }
        ],
        status: {
            type: String,
            enum: ['pending', 'resolved'],
            required: true,
            default: 'pending'
        },
        resolvedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
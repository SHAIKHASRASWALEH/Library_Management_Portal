import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "express-session"
const app = express()

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

app.use(cors({
    origin: [process.env.CORS_ORIGIN1,process.env.CORS_ORIGIN2],
    credentials: true,
}));

app.use(express.json())
app.use(cookieParser())

//routes import
import studentRouter from './routes/student.routes.js'
import adminRouter from './routes/admin.routes.js'
import bookRouter from './routes/book.routes.js'
import ratingRouter from './routes/rating.routes.js'
import BookIssueRouter from "./routes/bookIssue.routes.js"
import seatRouter from "./routes/seat.routes.js"
import seatBookingRouter from "./routes/seatBooking.routes.js"
import complaintRouter from "./routes/complaint.routes.js"
import authRoutes from './routes/auth_google.routes.js';
import articleRouter from './routes/article.routes.js';
import ArticleSharingRouter from './routes/articleSharing.routes.js';
import bookRecommendationRouter from './routes/bookRecommendation.routes.js';
import announcementRouter from './routes/announcement.routes.js';

//routes declaration
app.use("/api/v1/students", studentRouter)
app.use("/api/v1/admins", adminRouter)
app.use("/api/v1/books", bookRouter)
app.use("/api/v1/ratings", ratingRouter)
app.use("/api/v1/issue-books", BookIssueRouter)
app.use("/api/v1/seats", seatRouter)
app.use("/api/v1/seat-bookings", seatBookingRouter)
app.use("/api/v1/complaints", complaintRouter)
app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/article-sharing", ArticleSharingRouter);
app.use("/api/v1/book-recommendation", bookRecommendationRouter);
app.use("/api/v1/announcements", announcementRouter);

export { app }
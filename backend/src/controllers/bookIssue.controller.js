import { BookIssue } from "../models/bookIssue.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";
import { Student } from "../models/student.model.js";
import transporter from "../utils/email.js";
import { bookBookedMailHTML, cancelBookBookingMailHTML, issuedBookMailHTML, rejectIssueBookMailHTML, returnBookMailHTML, renewBookMailHTML, advanceBookDueDateReminderMailHTML, bookDueDateReminderMailHTML, bookOverdueFineMailHTML, cancelNotIssuedBookBookingMailHTML } from "../utils/mails.js";
import mongoose from "mongoose";
import cron from "node-cron";

const maxBooksIssuedPerStudent = 3;

const getAllBookIssues = asyncHandler(async (req, res) => {
    const bookIssues = await BookIssue.find();
    return res.status(200).json(
        new ApiResponse(200, bookIssues, "All book issues fetched successfully")
    );
});

const getAllBookIssuesWithDetails = asyncHandler(async (req, res) => {
    const bookIssues = await BookIssue.find()
    .populate('studentId','-password -refreshToken -createdAt -updatedAt') 
    .populate('bookId', '-createdAt -updatedAt -__v');

    return res.status(200).json(
        new ApiResponse(200, bookIssues, "All book issues fetched successfully")
    );
});

const getBookingById = asyncHandler(async (req, res) => {
    const bookIssue = await BookIssue.findById(req.params.id);
    if (!bookIssue) {
        throw new ApiError(404, "Booking not found");
    }
    return res.status(200).json(
        new ApiResponse(200, bookIssue, "Booking fetched successfully")
    );
});

const Bookbooking = asyncHandler(async (req, res) => {
    const { bookId } = req.body;
    const student = req.student;

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const studentId = student._id;

    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    const existingIssue = await BookIssue.findOne({ bookId: bookId, studentId: studentId, status: "issued" });
    if (existingIssue) {
        throw new ApiError(400, "You have already issued this book");
    }

    const existingBooking = await BookIssue.findOne({ bookId: bookId, studentId: studentId, status: "booked" });
    if (existingBooking) {
        throw new ApiError(400, "You have already booked this book");
    }

    if(book.available_copies <= 0){
        throw new ApiError(400, "Book not available");
    }

    if(student.booksIssued >= 3){
        throw new ApiError(400, "You can't issue more than 3 books at a time");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const issue = await BookIssue.create([{
            bookId: bookId,
            studentId: studentId,
            issueDate: new Date(),
            status: "booked",
            returnDate: new Date(new Date(new Date().setDate(new Date().getDate() + 14)).setHours(23,59,59,999))
        }],{session});
    
        book.available_copies -= 1;
        await book.save({session});
    
        student.booksIssued += 1;
        await student.save({session});

        await session.commitTransaction();

        res.status(200).json(
            new ApiResponse(200, issue, "Book booked successfully")
        );

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Book booked for issuing from library',
            html: bookBookedMailHTML(student.name, book.title, book.author, issue[0].issueDate, issue[0].returnDate)
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            console.log("error sending mail");
        }
    
        return; 
    }
    catch(error){
        await session.abortTransaction();
        throw new ApiError(500, error.message);
    }
    finally{
        await session.endSession();
    }

});

const cancelBooking = asyncHandler(async (req, res) => {
    const { bookbookingId } = req.params;
    const issuedBook = await BookIssue.findById(bookbookingId);
    if (!issuedBook) {
        throw new ApiError(404, "Booking not found");
    }

    if(issuedBook.status === "issued"){
        throw new ApiError(400, "Book already issued");
    }

    if(issuedBook.status === "returned"){
        throw new ApiError(400, "Book already returned");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        await BookIssue.deleteOne({ _id: bookbookingId }).session(session);
        const book = await Book.findById(issuedBook.bookId);
        book.available_copies += 1;
        await book.save({session});
        const student = await Student.findById(issuedBook.studentId);
        student.booksIssued -= 1;
        await student.save({session});

        await session.commitTransaction();

        res.status(200).json(
            new ApiResponse(200, {}, "Booking cancelled successfully")
        );

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Cancelled booking of book from library',
            html: cancelBookBookingMailHTML(student.name, book.title, book.author)
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            console.log('Error sending mail');
        }

        return;
    }
    catch(error){
        await session.abortTransaction();
        throw new ApiError(500, error.message);
    }
    finally{
        await session.endSession();
    }

});

const approveBookIssue = asyncHandler(async (req, res) => {

    const { bookbookingId } = req.body;
    const issuedBook = await BookIssue.findById(bookbookingId);
    if (!issuedBook) {
        throw new ApiError(404, "Booking not found");
    }

    if(issuedBook.status === "issued"){
        throw new ApiError(400, "Book already issued");
    }

    if(issuedBook.status === "returned"){
        throw new ApiError(400, "Book already returned");
    }

    const student = await Student.findById(issuedBook.studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const book = await Book.findById(issuedBook.bookId)

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        issuedBook.status = "issued";
        await issuedBook.save({session});

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Issue (check out) of book from the Library',
            html: issuedBookMailHTML(student.name, book.title, book.author, issuedBook.issueDate, issuedBook.returnDate )
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            throw new ApiError(500, error.message || 'Error sending mail');
        }

        await session.commitTransaction();

        return res.status(200).json(
            new ApiResponse(200, issuedBook, "Book issued successfully")
        );
    }
    catch{
        await session.abortTransaction();
        throw new ApiError(500, error.message);
    }
    finally{
        await session.endSession();
    }
    
});

const issueBook = asyncHandler(async (req, res) => {
    const { bookbookingId } = req.body;
    const student = req.student;
    const bookToBeIssued = await BookIssue.findById(bookbookingId);
    if (!bookToBeIssued) {
        throw new ApiError(404, "Booking not found");
    }
    if(bookToBeIssued.status === "issued"){
        throw new ApiError(400, "Book already issued");
    }
    if(bookToBeIssued.status === "returned"){
        throw new ApiError(400, "Book already returned");
    }
    if(bookToBeIssued.studentId.toString() !== student._id.toString()){
        throw new ApiError(400, "You are not authorized to issue this book");
    }
    const book = await Book.findById(bookToBeIssued.bookId);
    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    bookToBeIssued.status = "issued";
    await bookToBeIssued.save();

    res.status(200).json(
        new ApiResponse(200, bookToBeIssued, "Book issued successfully")   
    );

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Issue (check out) of book from the Library',
        html: issuedBookMailHTML(student.name, book.title, book.author, bookToBeIssued.issueDate, bookToBeIssued.returnDate )
    };

    try{
        await transporter.sendMail(mailOptions)
    }
    catch(error){
        console.log('Error sending mail');
    }

    return;

});


const rejectBookIssue = asyncHandler(async (req, res) => {
    
    const { bookbookingId } = req.params;
    const issuedBook = await BookIssue.findById(bookbookingId);
    if (!issuedBook) {
        throw new ApiError(404, "Booking not found");
    }

    if(issuedBook.status === "issued"){
        throw new ApiError(400, "Book already issued");
    }

    if(issuedBook.status === "returned"){
        throw new ApiError(400, "Book already returned");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        await issuedBook.deleteOne({ _id: bookbookingId }).session(session);
        const book = await Book.findById(issuedBook.bookId);
        book.available_copies += 1;
        await book.save({session});
        const student = await Student.findById(issuedBook.studentId);
        student.booksIssued -= 1;
        await student.save({session});

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Rejected booking of book by the Library',
            html: rejectIssueBookMailHTML(student.name, book.title, book.author )
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            throw new ApiError(500, error.message || 'Error sending mail');
        }

        await session.commitTransaction();

        return res.status(200).json(
            new ApiResponse(200, {}, "Booking rejected successfully")
        );
    }
    catch(error){
        await session.abortTransaction();
        throw new ApiError(500, error.message);
    }
    finally{
        await session.endSession();
    }

});

const returnBook = asyncHandler(async (req, res) => {
    const { bookbookingId } = req.body;
    const issuedBook = await BookIssue.findById(bookbookingId);
    if (!issuedBook) {
        throw new ApiError(404, "Booking not found");
    }

    if(issuedBook.status === "returned"){
        throw new ApiError(400, "Book already returned");
    }

    if(issuedBook.status === "booked"){
        throw new ApiError(400, "Book not issued yet");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        issuedBook.status = "returned";
        await issuedBook.save({session});
        const book = await Book.findById(issuedBook.bookId);
        book.available_copies += 1;
        await book.save({session});
        const student = await Student.findById(issuedBook.studentId);
        student.booksIssued -= 1;
        await student.save({session});

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Return (check in) of books to the Library',
            html: returnBookMailHTML(student.name, book.title, book.author, new Date() )
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            throw new ApiError(500, error.message || 'Error sending mail');
        }

        await session.commitTransaction();
        return res.status(200).json(
            new ApiResponse(200, {}, "Book returned successfully")
        );
    }
    catch(error){
        await session.abortTransaction();
        throw new ApiError(500, error.message);
    }
    finally{
        await session.endSession();
    }

});

const renewBook = asyncHandler(async (req, res) => {
    const { bookbookingId } = req.body;
    const issuedBook = await BookIssue.findById(bookbookingId);
    if (!issuedBook) {
        throw new ApiError(404, "Booking not found");
    }

    if(issuedBook.status === "returned"){
        throw new ApiError(400, "Book already returned");
    }

    if(issuedBook.status === "booked"){
        throw new ApiError(400, "Book not issued yet");
    }

    if(issuedBook.renewalCount === 1){
        throw new ApiError(400, "Maximum renewal limit reached");
    }

    if(issuedBook.returnDate < new Date()){
        throw new ApiError(400, "Book already overdue");
    }

    const student = await Student.findById(issuedBook.studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const book = await Book.findById(issuedBook.bookId);
    if (!book) {
        throw new ApiError(404, "Book not found");
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try{
        issuedBook.renewalCount += 1;
        issuedBook.returnDate = new Date(new Date().setDate(new Date().getDate() + 14));
        await issuedBook.save({session});
        await session.commitTransaction();

        res.status(200).json(
            new ApiResponse(200, {}, "Book renewed successfully")
        );

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Renewal of book issued from the Library',
            html: renewBookMailHTML(student.name, book.title, book.author, issuedBook.issueDate, issuedBook.returnDate )
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            console.log('Error sending mail');
        }

        return;
    }
    catch(error){
        await session.abortTransaction();
        throw new ApiError(500, error.message);
    }
    finally{
        await session.endSession();
    }

});

const advanceDueDateReminder = async () => {

    try{
        const bookIssues = await BookIssue.find({ status: "issued" });
        const today = new Date(new Date().setDate(new Date().getDate() + 1));
        const dueDate = new Date(new Date().setDate(new Date().getDate() + 2));

        if(bookIssues.length === 0){
            return;
        }

        bookIssues.forEach(async (bookIssue) => {
            if(bookIssue.returnDate <= dueDate && bookIssue.returnDate > today){
                const student = await Student.findById(bookIssue.studentId);
                const book = await Book.findById(bookIssue.bookId);
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: student.email,
                    subject: 'Advance notice of book(s) due on your library account',
                    html: advanceBookDueDateReminderMailHTML(student.name, book.title, book.author, bookIssue.returnDate )
                };

                try{
                    await transporter.sendMail(mailOptions)
                }
                catch(error){
                    console.log(error);
                }
            }
        });

        return;
    }
    catch(error){
        console.log(error);
    }

};


const dueDateReminder = async () => {
    try{
        const bookIssues = await BookIssue.find({ status: "issued" });
        const today = new Date();
        const dueDate = new Date(new Date().setDate(new Date().getDate() + 1));

        if(bookIssues.length === 0){
            return;
        }

        bookIssues.forEach(async (bookIssue) => {
            if(bookIssue.returnDate <= dueDate && bookIssue.returnDate > today){
                const student = await Student.findById(bookIssue.studentId);
                const book = await Book.findById(bookIssue.bookId);
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: student.email,
                    subject: 'Due date reminder of book(s) issued from the Library',
                    html: bookDueDateReminderMailHTML(student.name, book.title, book.author, bookIssue.returnDate )
                };

                try{
                    await transporter.sendMail(mailOptions)
                }
                catch(error){
                    console.log(error);
                }
            }
        });
        return;
    }
    catch(error){
        console.log(error);
    }
    
};

const addFine = async () => {
    try{
        const bookIssues = await BookIssue.find({ status: "issued", returnDate: { $lt: new Date() } });
        const today = new Date();

        if(bookIssues.length === 0){
            return;
        }

        bookIssues.forEach(async (bookIssue) => {
            const student = await Student.findById(bookIssue.studentId);
            const book = await Book.findById(bookIssue.bookId);
            const days = Math.floor((today - bookIssue.returnDate) / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(days / 7) + 1;
            const fine = Math.pow(2, weeks);
            student.fine += fine;
            await student.save();
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: 'Fine imposed for overdue book issued from the Library',
                html: bookOverdueFineMailHTML(student.name, book.title, book.author, bookIssue.returnDate, fine )
            };
            try{
                await transporter.sendMail(mailOptions)
            }
            catch(error){
                console.log(error);
            }
        });

        return;
    }
    catch(error){
        console.log(error);
    }

};

const cancelNotIssuedBookings = async () => {
    try{
        const bookIssues = await BookIssue.find({ status: "booked" });
        const today = new Date();
        const daysAfterIssue = 2;

        if(bookIssues.length === 0){
            return;
        }

        bookIssues.forEach(async (bookIssue) => {
            if(today - bookIssue.issueDate > daysAfterIssue * 1000 * 60 * 60 * 24){
                const student = await Student.findById(bookIssue.studentId);
                const book = await Book.findById(bookIssue.bookId);
                const fine = 10;

                const session = await mongoose.startSession();
                session.startTransaction();

                try{
                    await bookIssue.deleteOne().session(session);
                    book.available_copies += 1;
                    await book.save({session});
                    student.booksIssued -= 1;
                    student.fine += fine;
                    await student.save({session});

                    await session.commitTransaction();

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: student.email,
                        subject: 'Cancelled booking of book by the Library',
                        html: cancelNotIssuedBookBookingMailHTML(student.name, book.title, book.author, fine )
                    };
                    try{
                        await transporter.sendMail(mailOptions)
                    }
                    catch(error){
                        console.log(error);
                    }
                }
                catch(error){   
                    await session.abortTransaction();
                    console.log(error);
                }
                finally{
                    await session.endSession();
                }
            }
        });

        return;
    }
    catch(error){
        console.log(error);
    }

};


// try{
//     cron.schedule('0 0 * * *', () => {
//         console.log('Adding fines');
//         addFine();
//         console.log('Cancelling not issued bookings');
//         cancelNotIssuedBookings();
//         console.log('Sending mails for due date reminder');
//         dueDateReminder();
//         console.log('Sending mails for advanced due date reminder');
//         advanceDueDateReminder();
//     });
// }
// catch(error){
//     console.log(error);
// }



export { Bookbooking, approveBookIssue, rejectBookIssue, returnBook, renewBook, cancelBooking, getAllBookIssues, getBookingById, getAllBookIssuesWithDetails, issueBook };
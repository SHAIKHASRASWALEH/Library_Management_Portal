import { SeatBooking } from '../models/seatBooking.model.js';
import { Seat } from '../models/seat.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Student } from '../models/student.model.js';
import { PauseBooking } from '../models/pauseBooking.model.js';
import transporter from '../utils/email.js';
import { seatBookedMailHTML, cancelSeatBookingMailHTML, rejectSeatBookingMailHTML, upcomingSeatBookingMailHTML, endingSeatBookingMailHTML, pauseBookingsForRoomMailHTML } from '../utils/mails.js';
import cron from 'node-cron';

const maxBookedSeatHoursPerDay = 5;

const bookSeat = asyncHandler(async (req, res) => {
    const { seatId } = req.body;
    let startHour = req.body.startTime;
    const student = req.student;
    const now = new Date();
    let startTime = startHour;

    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    const studentId = student._id;

    if(student.blockedUntil > new Date()){
        throw new ApiError(403, 'Currently the student is blocked from booking');
    }

    if ([seatId, startTime, studentId].some((field) => field == undefined)) {
        throw new ApiError(400, 'All fields are required');
    }

    if(startTime < 0 || startTime > 23){
        throw new ApiError(400, 'Invalid start time');
    }

    startTime = new Date().setHours(startTime,0,0,0);

    let endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    if(endTime < now){
        startTime = new Date(new Date().setDate(now.getDate() + 1)).setHours(startHour,0,0,0);
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);
    }

    startTime = new Date(startTime);

    const seat = await Seat.findById(seatId);
    if (!seat) {
        throw new ApiError(404, 'Seat not found');
    }

    if(seat.isAvailable == false){
        throw new ApiError(400, 'Seat is not available');
    }

    const pauseBooking = await PauseBooking.findOne({ room: seat.room, pauseStartTime: { $lte: endTime }, pauseEndTime: { $gte: startTime } });
    if(pauseBooking){
        throw new ApiError(400, 'Bookings are paused for this time for this room');
    }

    // booked seat hours for today and tomorrow
    const bookedSeatHoursForTomorrow = await SeatBooking.aggregate([
        { $match: { studentId: studentId, startTime: { $gte: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0,0,0,0)) } } },
        { $group: { _id: null, totalBookedHours: { $sum: 1 } } }
    ]).then((result) => {
        if (result.length > 0) {
            return result[0].totalBookedHours;
        } else {
            return 0;
        }
    });

    const bookedSeatHours = await SeatBooking.aggregate([
        { $match: { studentId: studentId, startTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
        { $group: { _id: null, totalBookedHours: { $sum: 1 } } }
    ]).then((result) => {
        if (result.length > 0) {
            return result[0].totalBookedHours;
        } else {
            return 0;
        }
    });

    const bookedSeatHoursForToday = bookedSeatHours - bookedSeatHoursForTomorrow;

    const session = await mongoose.startSession();
    session.startTransaction();

    const existingBooking = await SeatBooking.findOne({ seatId, startTime });
    if (existingBooking) {
        throw new ApiError(400, 'Seat already booked');
    }

    const existingBookingForStudent = await SeatBooking.findOne({ studentId, startTime });
    if (existingBookingForStudent) {
        throw new ApiError(400, 'Student already has a seat booked for this time');
    }

    if (bookedSeatHoursForToday >= maxBookedSeatHoursPerDay && startTime.getDate() == new Date().getDate()) {
        throw new ApiError(400, `Student has already booked seats for ${maxBookedSeatHoursPerDay} hours for today`);
    }

    if (bookedSeatHoursForTomorrow >= maxBookedSeatHoursPerDay && startTime.getDate() != new Date().getDate()) {
        throw new ApiError(400, `Student has already booked seats for ${maxBookedSeatHoursPerDay} hours for tomorrow`);
    }

    try {
        const newBooking = await SeatBooking.create(
            [
                {
                    studentId,
                    seatId,
                    startTime,
                    endTime,
                },
            ],
            { session }
        );

        await session.commitTransaction();

        res.status(201).json(new ApiResponse(201, newBooking[0], 'Seat booked successfully'));

        const seat = await Seat.findById(seatId);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Seat booked successfully in the library',
            html: seatBookedMailHTML(student.name, startTime, endTime, seat.seatNumber, seat.seatType, seat.floor, seat.room),
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            console.log('Error sending mail');
        }

        return;

    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, error.message || 'An error occurred while booking seat');
    }
    finally {
        await session.endSession();
    }
});

const bookSeatByAdmin = asyncHandler(async (req, res) => {
    const { seatId, studentId } = req.body;
    let startHour = req.body.startTime;

    const now = new Date();
    let startTime = startHour;

    const seat = await Seat.findOne({ _id: seatId });
    if (!seat) {
        throw new ApiError(404, 'Seat not found');
    }

    const student = await Student.findOne({ _id: studentId });
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    if ([seatId, startTime, studentId].some((field) => field == undefined)) {
        throw new ApiError(400, 'All fields are required');
    }

    if(startTime < 0 || startTime > 23){
        throw new ApiError(400, 'Invalid start time');
    }

    startTime = new Date().setHours(startTime,0,0,0);

    let endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    if(endTime < now){
        startTime = new Date(new Date().setDate(now.getDate() + 1)).setHours(startHour,0,0,0);
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);
    }

    startTime = new Date(startTime);

    if(new Date().getHours() == 23 && new Date().getMinutes() > 55){
        throw new ApiError(400, 'Bookings cannot be made between 11:55 PM to 12:00 AM');
    }

    if(seat.isAvailable == false){
        throw new ApiError(400, 'Seat is not available');
    }

    const pauseBooking = await PauseBooking.findOne({ room: seat.room, pauseStartTime: { $lte: endTime }, pauseEndTime: { $gte: startTime } });
    if(pauseBooking){
        throw new ApiError(400, 'Bookings are paused for this time for this room');
    }

    // booked seat hours for today and tomorrow
    const bookedSeatHoursForTomorrow = await SeatBooking.aggregate([
        { $match: { studentId: studentId, startTime: { $gte: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0,0,0,0)) } } },
        { $group: { _id: null, totalBookedHours: { $sum: 1 } } }
    ]).then((result) => {
        if (result.length > 0) {
            return result[0].totalBookedHours;
        } else {
            return 0;
        }
    });

    const bookedSeatHours = await SeatBooking.aggregate([
        { $match: { studentId: studentId, startTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
        { $group: { _id: null, totalBookedHours: { $sum: 1 } } }
    ]).then((result) => {
        if (result.length > 0) {
            return result[0].totalBookedHours;
        } else {
            return 0;
        }
    });

    const bookedSeatHoursForToday = bookedSeatHours - bookedSeatHoursForTomorrow;

    const session = await mongoose.startSession();
    session.startTransaction();

    const existingBooking = await SeatBooking.findOne({ seatId, startTime });
    if (existingBooking) {
        throw new ApiError(400, 'Seat already booked');
    }

    const existingBookingForStudent = await SeatBooking.findOne({ studentId, startTime });
    if (existingBookingForStudent) {
        throw new ApiError(400, 'Student already has a seat booked for this time');
    }

    if (bookedSeatHoursForToday >= maxBookedSeatHoursPerDay && startTime.getDate() == new Date().getDate()) {
        throw new ApiError(400, `Student has already booked seats for ${maxBookedSeatHoursPerDay} hours for today`);
    }

    if (bookedSeatHoursForTomorrow >= maxBookedSeatHoursPerDay && startTime.getDate() != new Date().getDate()) {
        throw new ApiError(400, `Student has already booked seats for ${maxBookedSeatHoursPerDay} hours for today`);
    }

    try {
        const newBooking = await SeatBooking.create(
            [
                {
                    studentId,
                    seatId,
                    startTime,
                    endTime,
                },
            ],
            { session }
        );

        await session.commitTransaction();

        res.status(201).json(new ApiResponse(201, newBooking[0], 'Seat booked successfully'));

        const seat = await Seat.findById(seatId);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Seat booked successfully in the library',
            html: seatBookedMailHTML(student.name, startTime, endTime, seat.seatNumber, seat.seatType, seat.floor, seat.room),
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            console.log('Error sending mail');
        }

        return;

    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, error.message || 'An error occurred while booking seat');
    }
    finally {
        await session.endSession();
    }

});

const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const student = req.student;

    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    const booking = await SeatBooking.findById(bookingId);
    if (!booking) {
        throw new ApiError(404, 'Booking not found');
    }

    if (booking.studentId.toString() !== student._id.toString()) {
        throw new ApiError(403, 'Unauthorized');
    }

    if(booking.startTime < new Date()){
        throw new ApiError(400, 'Cannot cancel past bookings');
    }

    const seat = await Seat.findById(booking.seatId);
    const startTime = booking.startTime;
    const endTime = booking.endTime;

    if(new Date().getHours() == 23 && new Date().getMinutes() > 55){
        throw new ApiError(400, 'Bookings cannot be cancelled between 11:55 PM to 12:00 AM');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await SeatBooking.deleteOne({ _id: bookingId }).session(session);

        await session.commitTransaction();

        res.status(200).json(new ApiResponse(200, {}, 'Booking cancelled successfully'));

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Seat booking cancelled in the library',
            html: cancelSeatBookingMailHTML(student.name, startTime, endTime, seat.seatNumber, seat.seatType, seat.floor, seat.room),
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            console.log('Error sending mail');
        }

        return; 
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, error.message || 'An error occurred while cancelling booking');
    }
    finally {
        await session.endSession();
    }
});

const getBookingsOfStudent = asyncHandler(async (req, res) => {
    const student = req.student;

    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    const bookings = await SeatBooking.find({ studentId: student._id });

    return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
});

const getAllBookings = asyncHandler(async (req, res) => {

    const bookings = await SeatBooking.find().populate('seatId','-createdAt -updatedAt').populate('studentId','name rollNo email').sort({ startTime: 1 });

    return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
});

const getBookingsOfStudentWithSeatDetails = asyncHandler(async (req, res) => {
    const student = req.student;

    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    const bookings = await SeatBooking.find({ studentId: student._id }).populate('seatId', '-createdAt -updatedAt');

    return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
});

const getBookingsByStudentId = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    const bookings = await SeatBooking.find({ studentId });

    return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
});

const getBookingsBySeatId = asyncHandler(async (req, res) => {
    const { seatId } = req.params;

    const seat = await Seat.findById(seatId);

    if (!seat) {
        throw new ApiError(404, 'Seat not found');
    }

    const bookings = await SeatBooking.find({ seatId });

    return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
});

const getBookingsBySeatIdForToday = asyncHandler(async (req, res) => {
    const { seatId } = req.params;

    const seat = await Seat.findById(seatId);

    if (!seat) {
        throw new ApiError(404, 'Seat not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setHours(23,59,59,0);

    const bookings = await SeatBooking.find({ seatId, endTime: { $gt: today } });

    return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
});

const rejectBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.body;

    const booking = await SeatBooking.findById(bookingId);

    if (!booking) {
        throw new ApiError(404, 'Booking not found');
    }

    if(booking.startTime < new Date()){
        throw new ApiError(400, 'Cannot reject past bookings');
    }

    const startTime = booking.startTime;
    const endTime = booking.endTime;
    const seat = await Seat.findById(booking.seatId);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await SeatBooking.deleteOne({ _id: bookingId }).session(session);

        const student = await Student.findById(booking.studentId);

        await session.commitTransaction();
        res.status(200).json(new ApiResponse(200, {}, 'Booking rejected successfully'));

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Seat booking rejected by the library',
            html: rejectSeatBookingMailHTML(student.name, startTime, endTime, seat.seatNumber, seat.seatType, seat.floor, seat.room),
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            console.log('Error sending mail');
        }

        return;
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, error.message || 'An error occurred while rejecting booking');
    }
    finally {
        await session.endSession();
    }
});

const getAvailableSeatsByStartTime = asyncHandler(async (req, res) => {
    const { seatType, floor, room } = req.query;
    let startTime = req.query.startTime;
    if(startTime < 0 || startTime > 23){
        throw new ApiError(400, 'Invalid start time');
    }
    startTime = new Date().setHours(startTime,0,0,0);
    startTime = new Date(startTime);

    if ([startTime, seatType, floor, room].some((field) => field == undefined || field == '' || field == 0)) {
        throw new ApiError(400, 'All fields are required');
    }

    let endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    if(endTime < new Date()){
        startTime = startTime.setDate(startTime.getDate() + 1);
        startTime = new Date(startTime);
        endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);
    }

    const bookings = await SeatBooking.find({ startTime });

    const seats = await Seat.find({ seatType, floor, room });

    const pausedSeats = await PauseBooking.find({ room, pauseStartTime: { $lt: endTime }, pauseEndTime: { $gt: startTime } });
    if(pausedSeats.length > 0){
        return res.status(200).json(new ApiResponse(200, [], 'Available seats fetched successfully'));
    }

    const bookedSeatIds = new Set(bookings.map((booking) => booking.seatId.toString()));

    const availableSeats = seats.filter((seat) => !bookedSeatIds.has(seat._id.toString()));

    return res.status(200).json(new ApiResponse(200, availableSeats, 'Available seats fetched successfully'));

});

const pauseBookingsForRoom = asyncHandler(async (req, res) => {
    const { room, reason } = req.body;
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);

    if(!room || !reason || !startTime || !endTime){
        throw new ApiError(400, 'All fields are required');
    }

    const bookings = await SeatBooking.find({ startTime: { $gte: startTime, $lt: endTime } });

    for(let i=0; i<bookings.length; i++){

        const booking = bookings[i];
        if(booking.endTime < new Date()){
            continue;
        }
        const seat = await Seat.findById(booking.seatId);
        if(!seat){
            throw new ApiError(404, 'Seat not found');
        }
        if(seat.room != room){
            continue;
        }

        await SeatBooking.deleteOne({ _id: booking._id });

    }

    const existingPausedBooking = await PauseBooking.findOne({ room, pauseStartTime: { $lte: startTime }, pauseEndTime: { $gte: endTime } });
    if(existingPausedBooking){
        throw new ApiError(400, 'Bookings already paused for this time for this room');
    }

    const pausedBooking = await PauseBooking.create({
        room: room,
        pauseReason: reason,
        pauseStartTime: startTime,
        pauseEndTime: endTime,
    });

    if(!pausedBooking){
        throw new ApiError(500, 'Error pausing bookings');
    }
    
    res.status(200).json(new ApiResponse(200, {}, 'Bookings paused successfully'));

    const students = await Student.find({isAdminApproved: true});

    for(let i=0; i<students.length; i++){
        const student = students[i];
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Seat bookings paused in the library',
            html: pauseBookingsForRoomMailHTML(student.name, room, reason, startTime, endTime),
        };

        try{
            await transporter.sendMail(mailOptions)
        }
        catch(error){
            console.log('Error sending mail');
        }
    }
});

const resumeBookingsForRoom = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const pausedBooking = await PauseBooking.findById(id);
    if (!pausedBooking) {
        throw new ApiError(404, 'Paused booking not found');
    }

    await pausedBooking.deleteOne();

    res.status(200).json(new ApiResponse(200, {}, 'Bookings resumed successfully'));

});

const getUpcomingPauseBookings = asyncHandler(async (req, res) => {
    const now = new Date();
    const upcomingPauseBookings = await PauseBooking.find({ pauseEndTime: { $gte: now } }).sort({ pauseStartTime: 1 });

    return res.status(200).json(new ApiResponse(200, upcomingPauseBookings, 'Upcoming pause bookings fetched successfully'));
});

const getPauseSlotsByRoom = asyncHandler(async (req, res) => {
    const { room } = req.query;
    const now = new Date();
    
    const pauseBookings = await PauseBooking.find({ 
        room, 
        pauseEndTime: { $gte: now } 
    }).sort({ pauseStartTime: 1 });
    
    const currentHour = new Date(now);
    currentHour.setMinutes(0, 0, 0);
    
    const hourlySlots = [];
    
    for (let i = 0; i < 25; i++) {
        const startTime = new Date(currentHour);
        startTime.setHours(currentHour.getHours() + i);
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1);
        
        const isUnavailable = pauseBookings.some(booking => {
            return startTime < booking.pauseEndTime && endTime > booking.pauseStartTime;
        });

        if (isUnavailable) {
            hourlySlots.push(
                startTime.getHours()
            );
        }
    }
    
    return res.status(200).json(
        new ApiResponse(200, hourlySlots, 'Unavailable hourly slots fetched successfully')
    );
});

const getAllPauseBookings = asyncHandler(async (req, res) => {
    const pauseBookings = await PauseBooking.find().sort({ pauseStartTime: 1 });

    return res.status(200).json(new ApiResponse(200, pauseBookings, 'All pause bookings fetched successfully'));
});

const blockStudentFromBookingForSomeTime = asyncHandler(async (req, res) => {
    const { rollNo, numberOfDaysToBlockStudent } = req.body;

    const student = await Student.findOne({ rollNo });

    if (!student) {
        throw new ApiError(404, 'Student not found');
    }
    
    await SeatBooking.deleteMany({ studentId: student._id, endTime: { $gte: new Date() } });

    student.blockedUntil = new Date(new Date().setDate(new Date().getDate() + numberOfDaysToBlockStudent));
    await student.save();

    res.status(200).json(new ApiResponse(200, {}, 'Student blocked successfully'));
});

const getUpcomingBookings = asyncHandler(async (req, res) => {
    const bookings = await SeatBooking.find({ endTime: { $gt: new Date() } }).populate('seatId','-createdAt -updatedAt').populate('studentId','name rollNo email').sort({ startTime: 1 });
    return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
});

const getBookingsByParameters = asyncHandler(async (req, res) => {
    const { fromTime, toTime, rollNo } = req.query;

    if(!fromTime || !toTime){
        if(rollNo){
            const student = await Student.findOne({ rollNo });
            if(!student){
                throw new ApiError(404, 'Student not found');
            }
            const bookings = await SeatBooking.find({ studentId: student._id }).populate('seatId','-createdAt -updatedAt').populate('studentId','name rollNo email').sort({ startTime: -1 });
            return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
        }
        else{
            const bookings = await SeatBooking.find().populate('seatId','-createdAt -updatedAt').populate('studentId','name rollNo email').sort({ startTime: -1 });
            return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
        }
    }
    else{
        if(rollNo){
            const student = await Student.findOne({ rollNo });
            if(!student){
                throw new ApiError(404, 'Student not found');
            }
            const bookings = await SeatBooking.find({ studentId: student._id, startTime: { $gte: fromTime }, endTime: { $lte: toTime } }).populate('seatId','-createdAt -updatedAt').populate('studentId','name rollNo email').sort({ startTime: -1 });
            return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
        }
        else{
            const bookings = await SeatBooking.find({ startTime: { $gte: fromTime }, endTime: { $lte: toTime } }).populate('seatId','-createdAt -updatedAt').populate('studentId','name rollNo email').sort({ startTime: -1 });
            return res.status(200).json(new ApiResponse(200, bookings, 'Bookings fetched successfully'));
        }
    }
    
});

// try{
//     cron.schedule('56 23 * * *', async() => {
//         await Student.updateMany({isAdminApproved: true}, { bookedSeatHours: Student.bookedSeatHoursForTomorrow, bookedSeatHoursForTomorrow: 0 });
//         console.log('Reset booked seat hours');
//     });
// }
// catch(err){
//     console.log('Error resetting booked seat hours');
// }

try{
    cron.schedule('50 * * * *', async () => {

        let now = new Date();
        now.setMinutes(0, 0, 0);
        now = new Date(now);
        now.setHours(now.getHours() + 1);
        now = new Date(now);

        let bookings = await SeatBooking.find({startTime: now});
        for(let booking of bookings){
            const student = await Student.findOne({_id: booking.studentId});
            if(!student){
                throw new ApiError(404,'Student Not Found');
            }
            const seat = await Seat.findOne({_id: booking.seatId});
            if(!seat){
                throw new ApiError(404,'Seat Not Found');
            }
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: 'Reminder for upcoming seat booking',
                html: upcomingSeatBookingMailHTML(student.name, booking.startTime, booking.endTime, seat.seatNumber, seat.seatType, seat.floor, seat.room),
            };
    
            try{
                await transporter.sendMail(mailOptions)
            }
            catch(error){
                throw new ApiError(500, error.message || 'Error sending mail');
            }
        }

        console.log('Sent upcoming seat booking reminder mails');

        bookings = await SeatBooking.find({endTime: now});
        for(let booking of bookings){
            const student = await Student.findOne({_id: booking.studentId});
            if(!student){
                throw new ApiError(404,'Student Not Found');
            }
            const seat = await Seat.findOne({_id: booking.seatId});
            if(!seat){
                throw new ApiError(404,'Seat Not Found');
            }
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: 'Reminder for ending seat booking',
                html: endingSeatBookingMailHTML(student.name, booking.startTime, booking.endTime, seat.seatNumber, seat.seatType, seat.floor, seat.room),
            };
    
            try{
                await transporter.sendMail(mailOptions)
            }
            catch(error){
                throw new ApiError(500, error.message || 'Error sending mail');
            }
        }

        console.log('Sent ending seat booking reminder mails');
    });
}
catch(err){
    console.log('Error sending reminder seat booking mails.');
}

export { getAllBookings, bookSeat, bookSeatByAdmin, cancelBooking, getBookingsOfStudent, getBookingsByStudentId, getBookingsBySeatId, getBookingsBySeatIdForToday, rejectBooking, getBookingsOfStudentWithSeatDetails, getAvailableSeatsByStartTime, pauseBookingsForRoom, getAllPauseBookings, getUpcomingPauseBookings, getPauseSlotsByRoom, blockStudentFromBookingForSomeTime, resumeBookingsForRoom, getUpcomingBookings, getBookingsByParameters };

import { Router } from 'express';
import { getSeats, getSeat, addSeat, updateSeat, deleteSeat, getSeatsByRoom, addSeats, getAvailableSeats, changeSeatAvailabilityForRoom, getAllRooms } from '../controllers/seat.controller.js';
import { verifyJWTAdmin } from '../middlewares/auth.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

router.route("/get-all-seats").get(verifyJWT, getSeats)
router.route("/get-seat/:id").get(verifyJWT, getSeat)   
router.route("/get-seats-by-room/:room").get(verifyJWT, getSeatsByRoom);
router.route("/").post(verifyJWTAdmin, addSeat)
router.route("/add-multiple-seats").post(verifyJWTAdmin, addSeats)
router.route("/:id").patch(verifyJWTAdmin, updateSeat)
router.route("/").delete(verifyJWTAdmin, deleteSeat)
router.route("/get-available-seats").get(verifyJWT, getAvailableSeats)
router.route("/change-seat-availability-for-room").patch(verifyJWTAdmin, changeSeatAvailabilityForRoom)
router.route("/get-all-rooms").get(verifyJWT, getAllRooms);

export default router
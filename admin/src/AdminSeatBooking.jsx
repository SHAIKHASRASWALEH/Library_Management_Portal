import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";
import "./AdminSeatBooking.css";

const AdminSeatBooking = () => {
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatBookings, setSeatBookings] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [viewMode, setViewMode] = useState("room-first");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookedSeatsForTime, setBookedSeatsForTime] = useState([]);
  const [todayTimeSlots, setTodayTimeSlots] = useState([]);
  const [tomorrowTimeSlots, setTomorrowTimeSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState("today");
  
  // Admin-specific states
  const [studentRollNumber, setStudentRollNumber] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentExistingBookings, setStudentExistingBookings] = useState({
    today: [],
    tomorrow: []
  });
  const [rollNumberError, setRollNumberError] = useState("");
  const [searching, setSearching] = useState(false);

  // Fetch all seats on component mount
  useEffect(() => {
    setLoading(true);

    // Fetch all seats
    API.get("/seats/get-all-seats")
      .then((res) => {
        const seatsData = res.data.data;
        setSeats(seatsData);

        // Extract unique rooms from the seats data
        const uniqueRooms = [...new Set(seatsData.map(seat => seat.room))];

        // Create room objects with floor information
        const roomsWithFloors = uniqueRooms.map(roomName => {
          const roomSeats = seatsData.filter(seat => seat.room === roomName);
          const floor = roomSeats.length > 0 ? roomSeats[0].floor : 1;
          return { name: roomName, floor };
        });

        // Sort rooms by floor and name
        roomsWithFloors.sort((a, b) => {
          if (a.floor !== b.floor) return a.floor - b.floor;
          return a.name.localeCompare(b.name);
        });

        setRooms(roomsWithFloors);
        
        // Generate time slots
        generateTimeSlots();
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  // Function to generate time slots for today and tomorrow
  const generateTimeSlots = () => {
    // Get current time in IST
    const indianNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const currentHour = indianNow.getHours();

    // Generate slots for today (from current hour until midnight)
    const todaySlots = [];
    for (let hour = currentHour; hour < 24; hour++) {
      todaySlots.push({
        hour,
        day: "today",
        display: `${hour}:00 - ${hour + 1}:00`,
        isBooked: false,
        startTime: hour
      });
    }

    // Generate slots for tomorrow (from midnight until current hour)
    const tomorrowSlots = [];
    for (let hour = 0; hour < currentHour; hour++) {
      tomorrowSlots.push({
        hour,
        day: "tomorrow",
        display: `${hour}:00 - ${hour + 1}:00`,
        isBooked: false,
        startTime: hour
      });
    }

    setTodayTimeSlots(todaySlots);
    setTomorrowTimeSlots(tomorrowSlots);
  };

  // Function to search for a student by roll number
  const searchStudent = () => {
    if (!studentRollNumber.trim()) {
      setRollNumberError("Please enter a roll number");
      return;
    }
    
    setSearching(true);
    setRollNumberError("");
    
    // Call your API to find the student
    API.get(`/admins/get-student-by-rollNo/${studentRollNumber}`)
      .then((res) => {
        if (res.data.success) {
          setStudentInfo(res.data.data);
          
          // Fetch student's existing bookings
          return API.get(`/seat-bookings/get-by-student-id/${res.data.data._id}`);
        } else {
          setRollNumberError("Student not found");
          setSearching(false);
          throw new Error("Student not found");
        }
      })
      .then((res) => {
        const allBookings = res.data.data || [];

        // Current date values
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        // Separate bookings by day
        const todayBookings = allBookings.filter(booking => {
          const bookingDate = new Date(booking.startTime);
          return bookingDate.getDate() === today.getDate() &&
            bookingDate.getMonth() === today.getMonth() &&
            bookingDate.getFullYear() === today.getFullYear();
        });

        const tomorrowBookings = allBookings.filter(booking => {
          const bookingDate = new Date(booking.startTime);
          return bookingDate.getDate() === tomorrow.getDate() &&
            bookingDate.getMonth() === tomorrow.getMonth() &&
            bookingDate.getFullYear() === tomorrow.getFullYear();
        });

        setStudentExistingBookings({
          today: todayBookings,
          tomorrow: tomorrowBookings
        });
        
        setSearching(false);
      })
      .catch((err) => {
        console.error("Error searching for student:", err);
        if (!rollNumberError) {
          setRollNumberError("Error finding student");
        }
        setSearching(false);
      });
  };

  // Function to organize seats in a room into a theater-like layout
  const organizeRoomSeats = (roomName) => {
    const roomSeats = seats.filter(seat => seat.room === roomName);

    // Group seats by seat type
    const seatTypes = [...new Set(roomSeats.map(seat => seat.seatType))];

    const sections = seatTypes.map(type => {
      const typeSeats = roomSeats.filter(seat => seat.seatType === type);

      // Sort seats by seat number
      typeSeats.sort((a, b) => a.seatNumber - b.seatNumber);

      // Create rows (we'll group by 5 seats per row for visualization)
      const rows = [];
      const seatsPerRow = 10;

      for (let i = 0; i < typeSeats.length; i += seatsPerRow) {
        const rowSeats = typeSeats.slice(i, i + seatsPerRow);
        const rowLabel = String.fromCharCode(65 + Math.floor(i / seatsPerRow));

        rows.push({
          rowLabel,
          seats: rowSeats.map(seat => ({
            ...seat,
            rowLabel,
            seatPosition: (i % seatsPerRow) + 1
          }))
        });
      }

      return {
        name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
        rows
      };
    });

    return sections;
  };

  // Handle room selection
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSelectedSeat(null);
    setSelectedTimeSlots([]);

    // If in time-first mode and we already have a time slot selected,
    // fetch available seats for this room and time slot
    if (viewMode === "time-first" && selectedTimeSlot !== null) {
      fetchAvailableSeatsForRoomAndTime(room, selectedTimeSlot);
    }
  };

  // Fetch available seats for a specific room and time slot
  const fetchAvailableSeatsForRoomAndTime = (room, timeSlotObj) => {
    setLoading(true);

    API.get(`/seat-bookings/get-available-seats-by-slot?startTime=${timeSlotObj.startTime}&room=${room.name}&floor=${room.floor}&seatType=seat`)
      .then((res) => {
        // This endpoint returns AVAILABLE seats
        const availableSeats = res.data.data;

        // Get all seats for this room
        const allRoomSeats = seats.filter(seat => seat.room === room.name);

        // Determine which seats are booked by finding the ones NOT in the available seats list
        const bookedSeats = allRoomSeats.filter(roomSeat =>
          !availableSeats.some(availableSeat => availableSeat._id === roomSeat._id)
        );

        setBookedSeatsForTime(bookedSeats);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching available seats:", err);
        setLoading(false);
      });
  };

  // When a seat is selected, fetch its bookings for today and tomorrow
  const handleSelectSeat = (seat) => {
    if (viewMode === "room-first") {
      setSelectedSeat(seat);
      setSelectedTimeSlots([]);

      // Fetch bookings for the selected day
      API.get(`/seat-bookings/get-by-seat-id-for-today/${seat._id}`)
        .then((res) => {
          setSeatBookings(res.data.data);
        })
        .catch((err) => console.error("Error fetching seat bookings:", err));
    } else if (viewMode === "time-first") {
      // In time-first mode, we're selecting seats after a time and room are chosen
      // Check if the seat is already booked for the selected time
      const isBooked = bookedSeatsForTime.some(
        bookedSeat => bookedSeat._id === seat._id
      );

      if (!isBooked) {
        setSelectedSeat(seat);
        // In time-first mode, we already have a time slot selected
        setSelectedTimeSlots([selectedTimeSlot]);
      }
    }
  };

  // Get the available time slots based on selected day
  const getTimeSlots = () => {
    const slots = selectedDay === "today" ? todayTimeSlots : tomorrowTimeSlots;

    if (viewMode === "room-first" && selectedSeat) {
      // Mark booked slots based on seatBookings (bookings by anyone)
      const bookedSlots = seatBookings.map(booking => {
        const bookingTime = new Date(booking.startTime);
        // Create a unique identifier for each slot based on hour
        return bookingTime.getHours();
      });

      // Check student's own bookings for this day
      const studentBookedSlots = studentExistingBookings[selectedDay].map(booking => {
        const bookingTime = new Date(booking.startTime);
        return bookingTime.getHours();
      });

      return slots.map(slot => ({
        ...slot,
        isBooked: bookedSlots.includes(slot.hour),
        isStudentBooked: studentBookedSlots.includes(slot.hour)
      }));
    } else {
      // Check student's own bookings for this day
      const studentBookedSlots = studentExistingBookings[selectedDay].map(booking => {
        const bookingTime = new Date(booking.startTime);
        return bookingTime.getHours();
      });

      return slots.map(slot => ({
        ...slot,
        isBooked: studentBookedSlots.includes(slot.hour), // Mark student's bookings as booked
        isStudentBooked: studentBookedSlots.includes(slot.hour)
      }));
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelection = (slot) => {
    if (viewMode === "room-first") {
      // In room-first mode, we can select multiple time slots
      if (selectedTimeSlots.some(ts => ts.startTime === slot.startTime && ts.day === slot.day)) {
        // If already selected, remove it
        setSelectedTimeSlots(selectedTimeSlots.filter(ts =>
          !(ts.startTime === slot.startTime && ts.day === slot.day)
        ));
      } else {
        // If not booked, check if adding this slot would exceed 5 hours for the selected day
        if (!slot.isBooked) {
          // Get existing bookings for the selected day
          const existingBookingHours = studentExistingBookings[slot.day].length;

          // Count selected slots for the same day
          const selectedSlotsForSameDay = selectedTimeSlots.filter(ts => ts.day === slot.day).length;

          // If adding this slot would exceed 5 hours, show an alert
          if (existingBookingHours + selectedSlotsForSameDay + 1 > 5) {
            alert(`Student can only book a maximum of 5 hours per day for ${slot.day}.`);
            return;
          }

          // Otherwise, add the slot
          setSelectedTimeSlots([...selectedTimeSlots, slot]);
        }
      }
    } else if (viewMode === "time-first") {
      // In time-first mode, we only select one time slot
      // Check if selecting this slot would exceed the limit for the selected day
      const existingBookingHours = studentExistingBookings[slot.day].length;

      if (existingBookingHours + 1 > 5) {
        alert(`Student has already booked the maximum of 5 hours for ${slot.day}.`);
        return;
      }

      setSelectedTimeSlot(slot);
      setSelectedSeat(null);

      // Reset room selection but don't fetch available seats yet
      // We'll fetch after a room is selected
      setSelectedRoom(null);
      setBookedSeatsForTime([]);
    }
  };

  // Switch between view modes
  const toggleViewMode = () => {
    // Reset selections when switching modes
    setSelectedRoom(null);
    setSelectedSeat(null);
    setSelectedTimeSlots([]);
    setSelectedTimeSlot(null);
    setBookedSeatsForTime([]);
    setSeatBookings([]);

    setViewMode(viewMode === "room-first" ? "time-first" : "room-first");
  };

  // Switch between today and tomorrow
  const handleDayChange = (day) => {
    setSelectedDay(day);
    setSelectedTimeSlots([]);
  };

  // Submit booking for the selected seat and time slots
  const handleBookingSubmission = async () => {
    if (!studentInfo) {
      alert("Please search for a student first.");
      return;
    }
    
    if (viewMode === "room-first" && (!selectedTimeSlots.length || !selectedSeat)) {
      alert("Please select a seat and at least one time slot.");
      return;
    }

    if (viewMode === "time-first" && (!selectedTimeSlot || !selectedSeat)) {
      alert("Please select a time slot and a seat.");
      return;
    }

    const timeSlots = viewMode === "room-first" ? selectedTimeSlots : [selectedTimeSlot];

    // Group time slots by day for limit checking
    const todaySlots = timeSlots.filter(slot => slot.day === "today");
    const tomorrowSlots = timeSlots.filter(slot => slot.day === "tomorrow");

    // Check limits for each day
    if (todaySlots.length > 0 && (studentExistingBookings.today.length + todaySlots.length > 5)) {
      alert("This booking would exceed the student's daily limit of 5 hours for today.");
      return;
    }

    if (tomorrowSlots.length > 0 && (studentExistingBookings.tomorrow.length + tomorrowSlots.length > 5)) {
      alert("This booking would exceed the student's daily limit of 5 hours for tomorrow.");
      return;
    }

    try {
      // Create a booking for each selected time slot
      const bookingResponses = [];
      for (const slot of timeSlots) {
        console.log(selectedSeat);
        const response = await API.post("/seat-bookings/book-seat-by-admin", {
          seatId: selectedSeat._id,
          startTime: slot.startTime, // Just send the hour, backend will handle the date
          studentId: studentInfo._id
        });
        bookingResponses.push(response);
      }

      const slotText = timeSlots.length > 1
        ? `slots ${timeSlots.map(slot => `${slot.day} ${slot.display}`).join(", ")}`
        : `slot ${timeSlots[0].day} ${timeSlots[0].display}`;

      alert(`Seat ${selectedSeat.seatNumber} booked for ${studentInfo.name} (${studentInfo.rollNo}) for ${slotText}`);

      // Update studentExistingBookings with the new bookings
      const newBookings = bookingResponses.map(res => res.data.data);

      // Separate new bookings by day
      const newTodayBookings = newBookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        const today = new Date();
        return bookingDate.getDate() === today.getDate();
      });

      const newTomorrowBookings = newBookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return bookingDate.getDate() === tomorrow.getDate();
      });

      setStudentExistingBookings({
        today: [...studentExistingBookings.today, ...newTodayBookings],
        tomorrow: [...studentExistingBookings.tomorrow, ...newTomorrowBookings]
      });

      // Reset selections but keep student info
      if (viewMode === "room-first") {
        // Refresh bookings for the seat after a successful booking
        const res = await API.get(`/seat-bookings/get-by-seat-id-for-today/${selectedSeat._id}`);
        setSeatBookings(res.data.data);
        setSelectedTimeSlots([]);
      } else {
        // In time-first mode, refresh available seats for the selected time and room
        fetchAvailableSeatsForRoomAndTime(selectedRoom, selectedTimeSlot);
        setSelectedSeat(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book seat!");
    }
  };

  const handleCancelSelection = () => {
    if (viewMode === "room-first") {
      setSelectedSeat(null);
      setSelectedTimeSlots([]);
    } else {
      setSelectedSeat(null);
    }
  };
  
  const resetStudentSearch = () => {
    setStudentInfo(null);
    setStudentRollNumber("");
    setStudentExistingBookings({
      today: [],
      tomorrow: []
    });
    setSelectedRoom(null);
    setSelectedSeat(null);
    setSelectedTimeSlots([]);
    setSelectedTimeSlot(null);
  };

  return (
      <div className="admin-seat-booking-container">
        <div className="admin-seat-booking-header">
        <h2 style={{ color: '#495057' }}>✅ Seat Booking Administration</h2>

          <div className="admin-menu">
           
          </div>
        </div>

      <h2 className="heading_color">Book a Seat for Student</h2>
      
      {/* Student search section */}
      <div className="student-search-section">
        <div className="search-container">
          <input 
            type="text" 
            className="student-input" 
            placeholder="Enter student roll number" 
            value={studentRollNumber}
            onChange={(e) => setStudentRollNumber(e.target.value)}
            disabled={studentInfo !== null}
          />
          {!studentInfo ? (
            <button 
              className="search-btn" 
              onClick={searchStudent}
              disabled={searching}
            >
              {searching ? "Searching..." : "Search"}
            </button>
          ) : (
            <button 
              className="reset-btn" 
              onClick={resetStudentSearch}
            >
              Reset
            </button>
          )}
        </div>
        {rollNumberError && <p className="error-message">{rollNumberError}</p>}
        
        {studentInfo && (
          <div className="student-info">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> {studentInfo.name}</p>
            <p><strong>Roll Number:</strong> {studentInfo.rollNo}</p>
            <p><strong>Department:</strong> {studentInfo.department}</p>
            <div className="booking-limit-info">
              <p>
                Daily booking limit: {studentExistingBookings[selectedDay].length} of 5 hours used for {selectedDay}
                {viewMode === "room-first" && selectedTimeSlots.length > 0 ?
                  ` (${selectedTimeSlots.filter(slot => slot.day === selectedDay).length} additional hours selected)` :
                  ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {studentInfo && (
        <>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === "room-first" ? "active" : ""}`}
              onClick={() => toggleViewMode()}
            >
              Select Room First
            </button>
            <button
              className={`view-mode-btn ${viewMode === "time-first" ? "active" : ""}`}
              onClick={() => toggleViewMode()}
            >
              Select Time First
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading seats...</p>
            </div>
          ) : (
            <>
              {viewMode === "room-first" ? (
                // Room-first view mode
                <div className="booking-container">
                  {!selectedRoom ? (
                    // Step 1: Room selection
                    <div className="rooms-container">
                      <h3>Select a Room:</h3>
                      <div className="rooms-grid">
                        {rooms.map((room, idx) => (
                          <div
                            key={idx}
                            className="room-card"
                            onClick={() => handleSelectRoom(room)}
                          >
                            <h4>{room.name}</h4>
                            <p>Floor {room.floor}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : !selectedSeat ? (
                    // Step 2: Seat selection within the room
                    <div className="theater-container">
                      <div className="selected-room">
                        <h3>Room: {selectedRoom.name} (Floor {selectedRoom.floor})</h3>
                        <button className="back-btn" onClick={() => setSelectedRoom(null)}>
                          ← Back to Rooms
                        </button>
                      </div>

                      <div className="seat-legend">
                        <div className="legend-item">
                          <div className="legend-box available"></div>
                          <span>Available</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-box selected"></div>
                          <span>Selected</span>
                        </div>
                      </div>

                      <div className="theater-layout">
                        <div className="entrance">ENTRANCE</div>

                        {organizeRoomSeats(selectedRoom.name).map((section, sectionIdx) => (
                          <div key={sectionIdx} className="section-container">
                            <h3 className="section-title">{section.name}</h3>

                            <div className="rows-container">
                              {section.rows.map((row, rowIdx) => (
                                <div key={rowIdx} className="row">
                                  <div className="row-label">{row.rowLabel}</div>
                                  <div className="seats-row">
                                    {row.seats.map((seat, seatIdx) => (
                                      <div
                                        key={seatIdx}
                                        className={`theater-seat available`}
                                        onClick={() => handleSelectSeat(seat)}
                                      >
                                        {seat.seatNumber}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Step 3: Time slot selection for selected seat
                    <div className="time-slot-container">
                      <div className="selected-seat-info">
                        <h3>Selected Seat: {selectedSeat.seatNumber} ({selectedSeat.seatType}) in {selectedRoom.name}</h3>
                        <button className="back-btn" onClick={() => setSelectedSeat(null)}>
                          ← Back to Seats
                        </button>
                      </div>

                      <div className="day-selector">
                        <button
                          className={`day-btn ${selectedDay === "today" ? "active" : ""}`}
                          onClick={() => handleDayChange("today")}
                        >
                          Today
                        </button>
                        <button
                          className={`day-btn ${selectedDay === "tomorrow" ? "active" : ""}`}
                          onClick={() => handleDayChange("tomorrow")}
                        >
                          Tomorrow
                        </button>
                      </div>

                      <div className="time-slot-selection">
                        <h3>Select Time Slot(s) for {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}:</h3>
                        <p className="note">You can select multiple time slots (max 5 hours per day including existing bookings)</p>

                        <div className="time-slots-grid">
                          {getTimeSlots().map((slot, idx) => (
                            <div
                              key={idx}
                              className={`time-slot ${(slot.isBooked || slot.isStudentBooked) ? 'booked' : 'available'} ${selectedTimeSlots.some(ts => ts.startTime === slot.startTime && ts.day === slot.day) ? 'selected' : ''}`}
                              onClick={() => !slot.isBooked && handleTimeSlotSelection(slot)}
                            >
                              {slot.display}
                              
                            </div>
                          ))}
                        </div>

                        <div className="booking-actions">
                          <button
                            className="book-btn"
                            onClick={handleBookingSubmission}
                            disabled={selectedTimeSlots.length === 0}
                          >
                            Book Selected Slots
                          </button>
                          <button className="cancel-btn" onClick={handleCancelSelection}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Time-first view mode
                <div className="booking-container">
                  {!selectedTimeSlot ? (
                    // Step 1: Time slot selection
                    <div className="time-slot-container">
                      <div className="day-selector">
                        <button
                          className={`day-btn ${selectedDay === "today" ? "active" : ""}`}
                          onClick={() => handleDayChange("today")}
                        >
                          Today
                        </button>
                        <button
                          className={`day-btn ${selectedDay === "tomorrow" ? "active" : ""}`}
                          onClick={() => handleDayChange("tomorrow")}
                        >
                          Tomorrow
                        </button>
                      </div>

                      <h3>Select a Time Slot for {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}:</h3>
                      <p className="note">Student can book up to 5 hours per day</p>

                      <div className="time-slots-grid">
                        {getTimeSlots().map((slot, idx) => (
                          <div
                            key={idx}
                            className={`time-slot ${(slot.isBooked || slot.isStudentBooked) ? 'booked' : 'available'}`}
                            onClick={() => !slot.isBooked && handleTimeSlotSelection(slot)}
                          >
                            {slot.display}
                            
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : !selectedRoom ? (
                    // Step 2: Room selection after time selection
                    <div className="rooms-container">
                      <div className="selected-time-info">
                        <h3>Selected Time: {selectedTimeSlot.day.charAt(0).toUpperCase() + selectedTimeSlot.day.slice(1)}, {selectedTimeSlot.display}</h3>
                        <button className="back-btn" onClick={() => setSelectedTimeSlot(null)}>
                          ← Back to Time Slots
                        </button>
                      </div>

                      <h3>Select a Room:</h3>
                      <div className="rooms-grid">
                        {rooms.map((room, idx) => (
                          <div
                            key={idx}
                            className="room-card"
                            onClick={() => handleSelectRoom(room)}
                          >
                            <h4>{room.name}</h4>
                            <p>Floor {room.floor}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Step 3: Seat selection after both time and room are selected
                    <div className="theater-container">
                      <div className="selected-room-time-info">
                        <h3>Selected Time: {selectedTimeSlot.day.charAt(0).toUpperCase() + selectedTimeSlot.day.slice(1)}, {selectedTimeSlot.display} | Room: {selectedRoom.name} (Floor {selectedRoom.floor})</h3>
                        <div className="back-buttons">
                          <button className="back-btn" onClick={() => setSelectedRoom(null)}>
                            ← Back to Rooms
                          </button>
                          <button className="back-btn" onClick={() => {
                            setSelectedTimeSlot(null);
                            setSelectedRoom(null);
                          }}>
                            ← Back to Time Slots
                          </button>
                        </div>
                      </div>

                      <div className="seat-legend">
                        <div className="legend-item">
                          <div className="legend-box available"></div>
                          <span>Available</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-box selected"></div>
                          <span>Selected</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-box booked"></div>
                          <span>Booked</span>
                        </div>
                      </div>

                      <div className="theater-layout">
                        <div className="entrance">ENTRANCE</div>

                        {organizeRoomSeats(selectedRoom.name).map((section, sectionIdx) => (
                          <div key={sectionIdx} className="section-container">
                            <h3 className="section-title">{section.name}</h3>

                            <div className="rows-container">
                              {section.rows.map((row, rowIdx) => (
                                <div key={rowIdx} className="row">
                                  <div className="row-label">{row.rowLabel}</div>
                                  <div className="seats-row">
                                    {row.seats.map((seat, seatIdx) => {
                                      const isBooked = bookedSeatsForTime.some(
                                        bookedSeat => bookedSeat._id === seat._id
                                      );
                                      const isSelected = selectedSeat && selectedSeat._id === seat._id;
                                      
                                      return (
                                        <div
                                          key={seatIdx}
                                          className={`theater-seat ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                                          onClick={() => !isBooked && handleSelectSeat(seat)}
                                        >
                                          {seat.seatNumber}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedSeat && (
                        <div className="booking-actions">
                          <button
                            className="book-btn"
                            onClick={handleBookingSubmission}
                          >
                            Book Seat {selectedSeat.seatNumber} for {selectedTimeSlot.display}
                          </button>
                          <button className="cancel-btn" onClick={handleCancelSelection}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminSeatBooking;
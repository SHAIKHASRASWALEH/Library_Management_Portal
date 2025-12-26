import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const SeatManagement = ({
}) => {
  // ... (use the SeatManagement component code provided in previous answer)
  const [seats, setSeats] = useState([]);
  const [seatBookings, setSeatBookings] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('A'); // Default to room A
  const [pausedSeats, setPausedSeats] = useState([]);
  const [filterRollNo, setFilterRollNo] = useState('');
  const [pauseForm, setPauseForm] = useState({
    seatId: '',
    from: '',
    to: '',
    reason: ''
  });

  useEffect(() => {
    fetchSeats();
    fetchSeatBookings();
    fetchPausedSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}seats/get-all-seats`, { withCredentials: true });
      setSeats(response.data.data);
    } catch (error) {
      console.error("Error fetching seats:", error);
    }
  };

  const fetchSeatBookings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}seat-bookings/`, { withCredentials: true });
      setSeatBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching seat bookings:", error);
    }
  };

  const fetchPausedSeats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}seats/paused`, { withCredentials: true });
      setPausedSeats(response.data.data);
    } catch (error) {
      console.error("Error fetching paused seats:", error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}seat-bookings/${bookingId}`, { withCredentials: true });
      alert('Booking cancelled successfully!');
      fetchSeatBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert('Failed to cancel booking');
    }
  };

  const handlePauseSeat = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}seats/pause`, pauseForm, { withCredentials: true });
      alert('Seat paused successfully!');
      setPauseForm({ seatId: '', from: '', to: '', reason: '' });
      fetchPausedSeats();
    } catch (error) {
      console.error("Error pausing seat:", error);
      alert('Failed to pause seat');
    }
  };

  const handleResumeSeat = async (pauseId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}seats/resume/${pauseId}`, { withCredentials: true });
      alert('Seat resumed successfully!');
      fetchPausedSeats();
    } catch (error) {
      console.error("Error resuming seat:", error);
      alert('Failed to resume seat');
    }
  };

  // Filter seats by selected room
  const filteredSeats = seats.filter(seat => seat.room === selectedRoom);

  // Get bookings for current room
  const roomBookings = seatBookings.filter(booking => 
    booking.seatId && filteredSeats.some(seat => seat._id === booking.seatId._id)
  );

  // Apply roll number filter if specified
  const filteredBookings = filterRollNo 
    ? roomBookings.filter(booking => 
        booking.studentId?.rollNo?.includes(filterRollNo) ||
        (booking.studentId?.rollNo?.toLowerCase().includes(filterRollNo.toLowerCase())))
    : roomBookings;

  // Check if a seat is paused
  const isSeatPaused = (seatId) => {
    return pausedSeats.some(pause => 
      pause.seatId === seatId && 
      new Date(pause.from) <= new Date() && 
      new Date(pause.to) >= new Date()
    );
  };

  // Get pause info for a seat
  const getPauseInfo = (seatId) => {
    return pausedSeats.find(pause => 
      pause.seatId === seatId && 
      new Date(pause.from) <= new Date() && 
      new Date(pause.to) >= new Date()
    );
  };

  return (
    <div className="seat-management">
      <h3>🪑 Seat Management</h3>
      
      {/* Room Selection */}
      <div className="room-selection mb-4">
        <button 
          className={`btn ${selectedRoom === 'A' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setSelectedRoom('A')}
        >
          Room A
        </button>
        <button 
          className={`btn ${selectedRoom === 'B' ? 'btn-primary' : 'btn-outline-primary'} ml-2`}
          onClick={() => setSelectedRoom('B')}
        >
          Room B
        </button>
      </div>

      {/* Pause Seat Form */}
      <div className="pause-form mb-4 p-3 border rounded">
        <h5>Pause Seat Booking</h5>
        <form onSubmit={handlePauseSeat}>
          <div className="form-row">
            <div className="form-group col-md-3">
              <label>Seat</label>
              <select
                className="form-control"
                value={pauseForm.seatId}
                onChange={(e) => setPauseForm({...pauseForm, seatId: e.target.value})}
                required
              >
                <option value="">Select Seat</option>
                {filteredSeats.map(seat => (
                  <option key={seat._id} value={seat._id}>
                    {seat.seatType} - {seat.seatNumber}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-3">
              <label>From</label>
              <input
                type="datetime-local"
                className="form-control"
                value={pauseForm.from}
                onChange={(e) => setPauseForm({...pauseForm, from: e.target.value})}
                required
              />
            </div>
            <div className="form-group col-md-3">
              <label>To</label>
              <input
                type="datetime-local"
                className="form-control"
                value={pauseForm.to}
                onChange={(e) => setPauseForm({...pauseForm, to: e.target.value})}
                required
              />
            </div>
            <div className="form-group col-md-3">
              <label>Reason</label>
              <input
                type="text"
                className="form-control"
                value={pauseForm.reason}
                onChange={(e) => setPauseForm({...pauseForm, reason: e.target.value})}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-warning">Pause Seat</button>
        </form>
      </div>

      {/* Active Pauses */}
      {pausedSeats.filter(pause => 
        filteredSeats.some(seat => seat._id === pause.seatId) &&
        new Date(pause.to) >= new Date()
      ).length > 0 && (
        <div className="active-pauses mb-4">
          <h5>Active Pauses for Room {selectedRoom}</h5>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Seat</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pausedSeats
                .filter(pause => 
                  filteredSeats.some(seat => seat._id === pause.seatId) &&
                  new Date(pause.to) >= new Date()
                )
                .map(pause => (
                  <tr key={pause._id}>
                    <td>
                      {seats.find(s => s._id === pause.seatId)?.seatNumber || 'Unknown'}
                    </td>
                    <td>{new Date(pause.from).toLocaleString()}</td>
                    <td>{new Date(pause.to).toLocaleString()}</td>
                    <td>{pause.reason}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleResumeSeat(pause._id)}
                      >
                        Resume
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roll Number Filter */}
      <div className="rollno-filter mb-3">
        <input
          type="text"
          placeholder="Filter by Roll Number"
          className="form-control"
          style={{ maxWidth: '300px' }}
          value={filterRollNo}
          onChange={(e) => setFilterRollNo(e.target.value)}
        />
      </div>

      {/* Bookings Table */}
      <div className="bookings-table">
        <h5>Bookings for Room {selectedRoom}</h5>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Seat Number</th>
              <th>Seat Type</th>
              <th>Student Roll No</th>
              <th>Student Name</th>
              <th>Booking Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => {
              const seat = seats.find(s => s._id === booking.seatId?._id);
              const isPaused = seat && isSeatPaused(seat._id);
              const pauseInfo = seat && getPauseInfo(seat._id);

              return (
                <tr key={booking._id}>
                  <td>{seat?.seatNumber || 'Unknown'}</td>
                  <td>{seat?.seatType || 'Unknown'}</td>
                  <td>{booking.studentId?.rollNo || 'N/A'}</td>
                  <td>{booking.studentId?.name || 'N/A'}</td>
                  <td>
                    {new Date(booking.startTime).toLocaleString()} -{' '}
                    {new Date(booking.endTime).toLocaleString()}
                  </td>
                  <td>
                    {isPaused ? (
                      <span className="badge bg-warning">Paused</span>
                    ) : (
                      <span className="badge bg-success">Active</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={isPaused}
                    >
                      Cancel
                    </button>
                    {isPaused && (
                      <small className="text-muted ml-2">
                        {pauseInfo?.reason}
                      </small>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeatManagement;
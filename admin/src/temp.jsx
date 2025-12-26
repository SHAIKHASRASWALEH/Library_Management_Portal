<h5>Book a Seat</h5>
   
   <div className="form-group">
   <form>
     {/* Seat Type Input */}
     <label htmlFor="seatType">Seat Type</label>
       <select
         id="seatType"
         className="form-control mb-2"
         value={formData.seatType}
         onChange={(e) => setFormData({ ...formData, seatType: e.target.value })}
       >
         <option value="cubicle">Cubicle</option>
         <option value="seat">Seat</option>
         <option value="GDTable">GD Table</option>
         <option value="technobooth">Technobooth</option>
       </select>


     {/* Seat Number Input */}
     <label htmlFor="seatNumber">Seat Number</label>
     <input
       id="seatNumber"
       className="form-control mb-2"
       value={formData.seatNumber}
       onChange={(e) => setFormData({ ...formData, seatNumber: (e.target.value) })}
     />

     {/* Floor Input */}
     <label htmlFor="floor">Floor</label>
     <select
       id="floor"
       className="form-control mb-2"
       value={formData.floor}
       onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
     >
         <option value="1">1</option>
         <option value="2">2</option>
         </select>
       

     {/* Roll No Input */}
     <label htmlFor="rollNo">Roll No</label>
     <input
       type="text"
       id="rollNo"
       className="form-control mb-2"
       value={formData.rollNo}
       onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
     />
<label htmlFor="startTime">Start Time</label>
<select
 id="startTime"
 className="form-control mb-2"
 value={formData.startTime}
 onChange={(e) => setFormData({ ...formData, startTime: parseInt(e.target.value) })}
>
 {Array.from({ length: 23 }, (_, i) => {
   const now = new Date();
   let startHour = now.getHours() + 1 + i; // Next hour onwards
   if (startHour >= 24) startHour -= 24; // Wrap around to 0-23

   // Exclude the 11:55 PM - 12:00 AM slot (23:55 - 00:00)
   if (startHour === 23) return null;

   // Convert to 12-hour format with AM/PM
   const endHour = startHour + 1;
   const formatHour = (hour) => {
     const period = hour >= 12 ? "PM" : "AM";
     let formattedHour = hour % 12 || 12; // Convert 0 to 12
     return `${formattedHour} ${period}`;
   };

   return (
     <option key={startHour} value={startHour}>
       {`${formatHour(startHour)} - ${formatHour(endHour)}`}
     </option>
   );
 })}
</select>





     {/* Submit Button */}
     <button type="button" className="btn btn-success mt-2" onClick={handleBookSeat}>
       Book Seat
     </button>
   </form>
 </div>
 <h5>Seat Bookings</h5>

 <div className="mb-3 d-flex flex-wrap">
 <input 
   type="text" 
   placeholder="Filter by Seat Type" 
   value={bookingFilter.seatType}
   onChange={(e) => setBookingFilter({ ...bookingFilter, seatType: e.target.value })}
   className="form-control mr-2 mb-2"
   style={{ maxWidth: '200px' }}
 />
 <input 
   type="text"
   placeholder="Filter by Student Roll Number" 
   value={bookingFilter.studentRollNo}
   onChange={(e) => setBookingFilter({ ...bookingFilter, studentRollNo: e.target.value })}
   className="form-control mr-2 mb-2"
   style={{ maxWidth: '200px' }}
 />
 <input 
   type="number" 
   placeholder="Filter by Seat Number" 
   value={bookingFilter.seatNumber}
   onChange={(e) => setBookingFilter({ ...bookingFilter, seatNumber: e.target.value })}
   className="form-control mb-2"
   style={{ maxWidth: '200px' }}
 />
</div>
<table className="table table-striped">
                <thead>
                  <tr>
                    <th>Seat Type</th>
                    <th>Seat Number</th>
                    <th>Floor</th>
                    <th>Student Roll Number</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {seatBookings.filter(booking => 
                    (bookingFilter.seatType === '' || booking.seatId.seatType.toLowerCase().includes(bookingFilter.seatType.toLowerCase())) &&
                    (bookingFilter.studentRollNo === '' || booking.studentId.rollNo.includes(bookingFilter.studentRollNo)) &&
                    (bookingFilter.seatNumber === '' || booking.seatId.seatNumber == bookingFilter.seatNumber)
                  ).map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.seatId.seatType}</td>
                      <td>{booking.seatId.seatNumber}</td>
                      <td>{booking.seatId.floor}</td>
                      <td>{booking.studentId.rollNo}</td>
                      <td>{new Date(booking.startTime).toLocaleString("en-US", { 
    timeZone: "Asia/Kolkata", 
    hour: "2-digit", 
    minute: "2-digit", 
    hour12: true 
})}</td>

<td>{new Date(booking.endTime).toLocaleString("en-US", { 
    timeZone: "Asia/Kolkata", 
    hour: "2-digit", 
    minute: "2-digit", 
    hour12: true 
})}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
import jwt from 'jsonwebtoken'

const verificationMailHTML = (name, email, dateOfBirth, gender, phoneNumber, rollNo, department, degree, password) => `
    <html lang="en">
    <head>
      <style>
        /* Global Styles */
        body {
          font-family: Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 0;
          background-color:rgb(190, 186, 186);
        }
          
        a {
            text-decoration: none;
        }


        table {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-spacing: 0;
          border-radius: 8px;
        }

        /* Header Styles */
        .header {
          background-color: #007bff;
          color: rgb(0, 0, 0);
          padding: 20px;
          text-align: center;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          font-size: 40px;
          font-weight: bold;
        }

        /* Body Styles */
        .content {
          padding: 20px;
          text-align: center;
        }

        h1 {
          color: #333;
          font-size: 24px;
          margin-bottom: 15px;
        }

        p {
          font-size: 16px;
          line-height: 1.5;
        }

        /* Button Styles */
        .button {
          background-color: #007bff;
          color: black;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          font-size: 20px;
          border-radius: 10px;
          display: inline-block;
          margin-top: 20px;
        }

        .button:hover {
          background-color:rgb(23, 101, 185);
        }

      </style>
    </head>
    <body>
      <table>
        <!-- Header Section -->
        <tr>
          <td class="header">
            Library, IIT Ropar
          </td>
        </tr>

        <!-- Body Section -->
        <tr style="background-color:rgb(212, 206, 206);">
          <td class="content">
            <h1>Click the button below to verify your mail</h1>
            <p>Dear ${name},</p>
            <p>We got a request from you to get registered for IIT Ropar library services. To continue your registration please click the link below to verify your email id</p>
            <a href="http://localhost:3000/api/v1/students/verify-email?token=${jwt.sign({ name, email, dateOfBirth, gender, phoneNumber, rollNo, department, degree, password }, process.env.JWT_EMAIL_SECRET, { expiresIn: '1h' })}" class="button" target="_blank" style="color: black; text-decoration: none;">Verify mail</a>
          </td>
        </tr>
      </table>
    </body>
    </html>
`

const resetPasswordMailHTML = (email, name) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #1a237e;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .important-notice {
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 12px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #dddddd;
            font-size: 0.9em;
            color: #555555;
        }
        .button {
            display: inline-block;
            background-color: #1b41c9;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 4px;
            margin: 15px 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th {
            background-color: #e8eaf6;
            color: #1a237e;
            text-align: left;
        }
        th, td {
            border: 1px solid #dddddd;
            padding: 12px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Password Reset Request</h2>
    </div>
    
    <p>Dear ${name},</p>
    
    <p>We have received a request to reset the password for your Nalanda Library account:</p>
    
    
    <div class="important-notice">
        <p><strong>Important:</strong> To reset your password, please click the button below. This link will expire in <strong>1 hour</strong> for security reasons.</p>
    </div>
    
    <center>
        <a href="${process.env.Frontend_URL}/reset-password?token=${jwt.sign({ email }, process.env.JWT_EMAIL_SECRET, { expiresIn: '1h' })}" class="button" style="color: white;" target="_blank">Reset Password</a>
    </center>
    
    <p>If you did not request a password reset, please ignore this email or contact the library helpdesk at <a href="mailto:libraryhelpdesk@iitrpr.ac.in">libraryhelpdesk@iitrpr.ac.in</a>.</p>
    
    <div class="footer">
        <p>Thank You</p>
        <p><strong>Nalanda Library</strong><br>
        Indian Institute of Technology Ropar<br>
        Rupnagar, Punjab - 140001</p>
    </div>
</body>
</html>`;

const approvedRegistrationMailHTML = (name) => `
    <html lang="en">
    <head>
      <style>
        /* Global Styles */
        body {
          font-family: Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 0;
          background-color:rgb(190, 186, 186);
        }
          
        a {
            text-decoration: none;
        }


        table {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-spacing: 0;
          border-radius: 8px;
        }

        /* Header Styles */
        .header {
          background-color: #007bff;
          color: rgb(0, 0, 0);
          padding: 20px;
          text-align: center;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          font-size: 40px;
          font-weight: bold;
        }

        /* Body Styles */
        .content {
          padding: 20px;
          text-align: center;
        }

        h1 {
          color: #333;
          font-size: 24px;
          margin-bottom: 15px;
        }

        p {
          font-size: 16px;
          line-height: 1.5;
        }

        /* Button Styles */
        .button {
          background-color: #007bff;
          color: black;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          font-size: 20px;
          border-radius: 10px;
          display: inline-block;
          margin-top: 20px;
        }

        .button:hover {
          background-color:rgb(23, 101, 185);
        }

      </style>
    </head>
    <body >
      <table>
        <!-- Header Section -->
        <tr>
          <td class="header">
            Library, IIT Ropar
          </td>
        </tr>

        <!-- Body Section -->
        <tr style="background-color:rgb(212, 206, 206);">
          <td class="content">
            <h1>You account has been verified</h1>
            <p>Dear ${name},</p>
            <p>Your account for IIT Ropar library services has been successfully verified. You can now login to your account. You can click the below button to go to the library website.</p>
            <a href="${process.env.Frontend_URL}/login.html" class="button" target="_blank" style="color: black; text-decoration: none;">Login</a>
          </td>
        </tr>
      </table>
    </body>
    </html>
        `

const rejectedRegistrationMailHTML = (name) => `
        <html lang="en">
        <head>
          <style>
            /* Global Styles */
            body {
              font-family: Arial, sans-serif;
              color: #333;
              margin: 0;
              padding: 0;
              background-color:rgb(190, 186, 186);
            }
              
            a {
                text-decoration: none;
            }
    
    
            table {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-spacing: 0;
              border-radius: 8px;
            }
    
            /* Header Styles */
            .header {
              background-color: #007bff;
              color: rgb(0, 0, 0);
              padding: 20px;
              text-align: center;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
              font-size: 40px;
              font-weight: bold;
            }
    
            /* Body Styles */
            .content {
              padding: 20px;
              text-align: center;
            }
    
            h1 {
              color: #333;
              font-size: 24px;
              margin-bottom: 15px;
            }
    
            p {
              font-size: 16px;
              line-height: 1.5;
            }
    
            /* Button Styles */
            .button {
              background-color: #007bff;
              color: black;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              font-size: 20px;
              border-radius: 10px;
              display: inline-block;
              margin-top: 20px;
            }
    
            .button:hover {
              background-color:rgb(23, 101, 185);
            }
    
          </style>
        </head>
        <body >
          <table>
            <!-- Header Section -->
            <tr>
              <td class="header">
                Library, IIT Ropar
              </td>
            </tr>
    
            <!-- Body Section -->
            <tr style="background-color:rgb(212, 206, 206);">
              <td class="content">
                <h1>You account details could not be verified</h1>
                <p>Dear ${name},</p>
                <p>Your account for IIT Ropar library services has not been verified. You can again try to register with correct details. To register again click the button below.</p>
                <a href="${process.env.Frontend_URL}/register.html" class="button" target="_blank" style="color: black; text-decoration: none;">Register</a>
              </td>
            </tr>
          </table>
        </body>
        </html>
            `


const bookBookedMailHTML = (name, title, author, bookingDate, dueDate) => `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Book Checkout Notification</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book has been booked by you from the library website:</p>
        <p>You can come to the library to issue(check out) this book</p>
        <p>Make sure to issue the book within 2 days of booking to avoid any fines</p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Issue Date</th>
                <th>Due Date</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
                <td>${bookingDate}</td>
                <td>${dueDate}</td>
            </tr>
        </table>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>
    </body>
    </html>

`

const cancelBookBookingMailHTML = (name, title, author) => `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Book Checkout Notification</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book's booking has been cancelled by you from the library website:</p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
            </tr>
        </table>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>
    </body>
    </html>
`

const issuedBookMailHTML = (name, title, author, bookingDate, dueDate) => `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Book Checkout Notification</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book has been issued (checked out) from the library:</p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Issue Date</th>
                <th>Due Date</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
                <td>${bookingDate}</td>
                <td>${dueDate}</td>
            </tr>
        </table>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>
    </body>
    </html>

`

const rejectIssueBookMailHTML = (name, title, author) => `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Book Checkout Notification</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book's booking has been rejected by the library:</p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
            </tr>
        </table>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>
    </body>
    </html>
`

const returnBookMailHTML = (name, title, author, returnDate) => `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Book Checkout Notification</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book has been returned (checked in) to the library:</p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Return Date</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
                <td>${returnDate}</td>
            </tr>
        </table>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>
    </body>
    </html>

`

const renewBookMailHTML = (name, title, author, bookingDate, dueDate) => `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Book Checkout Notification</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book has been renewed on your library account:</p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Issue Date</th>
                <th>Due Date</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
                <td>${bookingDate}</td>
                <td>${dueDate}</td>
            </tr>
        </table>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>
    </body>
    </html>

`

const advanceBookDueDateReminderMailHTML = (name, title, author, dueDate) => `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Book Checkout Notification</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book issued to you will be due soon.</p>
        <p>Please consider either renewing or returning the same to the library.</p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Due Date</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
                <td>${dueDate}</td>
            </tr>
        </table>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>
    </body>
    </html>

`

const bookDueDateReminderMailHTML = (name, title, author, dueDate) => `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Book Checkout Notification</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book(s) are due on your library account </p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Due Date</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
                <td>${dueDate}</td>
            </tr>
        </table>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>
    </body>
    </html>

`

const seatBookedMailHTML = (name, startTime, endTime, seatNumber, seatType, floor, room) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seat Booking Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #1a237e;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #dddddd;
            font-size: 0.9em;
            color: #555555;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th {
            background-color: #e8eaf6;
            color: #1a237e;
            text-align: left;
        }
        th, td {
            border: 1px solid #dddddd;
            padding: 12px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .guidelines {
            margin-top: 20px;
            border: 1px solid #dddddd;
            padding: 15px;
            background-color: #f9f9f9;
        }
        .dos h4 {
            color: #007bff;
        }
        .donts h4 {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Seat Booking Confirmation</h2>
    </div>
    
    <p>Dear ${name},</p>

    <p>The following seat has been booked by you in the library:</p>

    <table>
        <tr>
            <th style="white-space: nowrap;">Seat Type</th>
            <th style="white-space: nowrap;">Seat Number</th>
            <th>Floor</th>
            <th>Room</th>
            <th>From</th>
            <th>To</th>
        </tr>
        <tr>
            <td style="text-align: center;">${seatType}</td>
            <td style="text-align: center;">${seatNumber}</td>
            <td style="text-align: center;">${floor}</td>
            <td style="text-align: center;">${room}</td>
            <td>${startTime}</td>
            <td>${endTime}</td>
        </tr>
    </table>

    <div>
        <h3>Please follow these library guidelines:</h3>
        
        <div class="dos">
            <h4>Do's:</h4>
            <ul>
                <li>Arrive on time for your booking</li>
                <li>Keep your area clean and tidy</li>
                <li>Maintain silence in the reading areas</li>
                <li>Report any issues with your seat to library staff</li>
                <li>Cancel your booking before Start Time of your booking if you cannot attend</li>
                <li>Empty your seat before the end time of your booking</li>
            </ul>
        </div>
        
        <div class="donts">
            <h4>Don'ts:</h4>
            <ul>
                <li>Don't leave your belongings after your booking end time</li>
                <li>Don't consume food or drinks (except water)</li>
                <li>Don't damage library property</li>
                <li>Don't disturb other library users</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p>Thank You</p>
        <p><strong>Nalanda Library</strong><br>
        Indian Institute of Technology Ropar<br>
        Rupnagar, Punjab - 140001</p>
    </div>
</body>
</html>
`;

const cancelSeatBookingMailHTML = (name, startTime, endTime, seatNumber, seatType, floor, room) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seat Booking Cancellation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #1a237e;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #dddddd;
            font-size: 0.9em;
            color: #555555;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th {
            background-color: #e8eaf6;
            color: #1a237e;
            text-align: left;
        }
        th, td {
            border: 1px solid #dddddd;
            padding: 12px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Seat Booking Cancellation</h2>
    </div>
    
    <p>Dear ${name},</p>

    <p>The following seat's booking in the library has been cancelled by you:</p>

    <table>
        <tr>
            <th style="white-space: nowrap;">Seat Type</th>
            <th style="white-space: nowrap;">Seat Number</th>
            <th>Floor</th>
            <th>Room</th>
            <th>From</th>
            <th>To</th>
        </tr>
        <tr>
            <td style="text-align: center;">${seatType}</td>
            <td style="text-align: center;">${seatNumber}</td>
            <td style="text-align: center;">${floor}</td>
            <td style="text-align: center;">${room}</td>
            <td>${startTime}</td>
            <td>${endTime}</td>
        </tr>
    </table>

    <p>If you have any questions regarding your cancellation, please contact the library helpdesk at <a href="mailto:libraryhelpdesk@iitrpr.ac.in">libraryhelpdesk@iitrpr.ac.in</a>.</p>

    <div class="footer">
        <p>Thank You</p>
        <p><strong>Nalanda Library</strong><br>
        Indian Institute of Technology Ropar<br>
        Rupnagar, Punjab - 140001</p>
    </div>
</body>
</html>
`;

const rejectSeatBookingMailHTML = (name, startTime, endTime, seatNumber, seatType, floor, room) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seat Booking Rejection</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #1a237e;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #dddddd;
            font-size: 0.9em;
            color: #555555;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th {
            background-color: #e8eaf6;
            color: #1a237e;
            text-align: left;
        }
        th, td {
            border: 1px solid #dddddd;
            padding: 12px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    
    <p>Dear ${name},</p>

    <p>The following seat's booking in the library has been rejected by the admin:</p>

    <table>
        <tr>
            <th style="white-space: nowrap;">Seat Type</th>
            <th style="white-space: nowrap;">Seat Number</th>
            <th>Floor</th>
            <th>Room</th>
            <th>From</th>
            <th>To</th>
        </tr>
        <tr>
            <td style="text-align: center;">${seatType}</td>
            <td style="text-align: center;">${seatNumber}</td>
            <td style="text-align: center;">${floor}</td>
            <td style="text-align: center;">${room}</td>
            <td>${startTime}</td>
            <td>${endTime}</td>
        </tr>
    </table>

    <p>If you have any questions regarding this rejection, please contact the library helpdesk at <a href="mailto:libraryhelpdesk@iitrpr.ac.in">libraryhelpdesk@iitrpr.ac.in</a>.</p>

    <div class="footer">
        <p>Thank You</p>
        <p><strong>Nalanda Library</strong><br>
        Indian Institute of Technology Ropar<br>
        Rupnagar, Punjab - 140001</p>
    </div>
</body>
</html>
`;

const upcomingSeatBookingMailHTML = (name, startTime, endTime, seatNumber, seatType, floor, room) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seat Booking Reminder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #1a237e;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #dddddd;
            font-size: 0.9em;
            color: #555555;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th {
            background-color: #e8eaf6;
            color: #1a237e;
            text-align: left;
        }
        th, td {
            border: 1px solid #dddddd;
            padding: 12px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .guidelines {
            margin-top: 20px;
            border: 1px solid #dddddd;
            padding: 15px;
            background-color: #f9f9f9;
        }
        .dos h4 {
            color: #007bff;
        }
        .donts h4 {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Seat Booking Reminder</h2>
    </div>
    
    <p>Dear ${name},</p>

    <p>Gentle reminder to occupy the seat booked by you in the library:</p>

    <table>
        <tr>
            <th style="white-space: nowrap;">Seat Type</th>
            <th style="white-space: nowrap;">Seat Number</th>
            <th>Floor</th>
            <th>Room</th>
            <th>From</th>
            <th>To</th>
        </tr>
        <tr>
            <td style="text-align: center;">${seatType}</td>
            <td style="text-align: center;">${seatNumber}</td>
            <td style="text-align: center;">${floor}</td>
            <td style="text-align: center;">${room}</td>
            <td>${startTime}</td>
            <td>${endTime}</td>
        </tr>
    </table>

    <div>
        <h3>Please follow these library guidelines:</h3>
        
        <div class="dos">
            <h4>Do's:</h4>
            <ul>
                <li>Arrive on time for your booking</li>
                <li>Keep your area clean and tidy</li>
                <li>Maintain silence in the reading areas</li>
                <li>Report any issues with your seat to library staff</li>
                <li>Cancel your booking before Start Time of your booking if you cannot attend</li>
                <li>Empty your seat before the end time of your booking</li>
            </ul>
        </div>
        
        <div class="donts">
            <h4>Don'ts:</h4>
            <ul>
                <li>Don't leave your belongings after your booking end time</li>
                <li>Don't consume food or drinks (except water)</li>
                <li>Don't damage library property</li>
                <li>Don't disturb other library users</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p>Thank You</p>
        <p><strong>Nalanda Library</strong><br>
        Indian Institute of Technology Ropar<br>
        Rupnagar, Punjab - 140001</p>
    </div>
</body>
</html>
`;

const endingSeatBookingMailHTML = (name, startTime, endTime, seatNumber, seatType, floor, room) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seat Booking Expiry Notice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #1a237e;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #dddddd;
            font-size: 0.9em;
            color: #555555;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th {
            background-color: #e8eaf6;
            color: #1a237e;
            text-align: left;
        }
        th, td {
            border: 1px solid #dddddd;
            padding: 12px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .guidelines {
            margin-top: 20px;
            border: 1px solid #dddddd;
            padding: 15px;
            background-color: #f9f9f9;
        }
        .dos h4 {
            color: #007bff;
        }
        .donts h4 {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <p>Dear ${name},</p>

    <p>Gentle reminder to vacate the following seat booked by you in the library:</p>

    <table>
        <tr>
            <th style="white-space: nowrap;">Seat Type</th>
            <th style="white-space: nowrap;">Seat Number</th>
            <th>Floor</th>
            <th>Room</th>
            <th>From</th>
            <th>To</th>
        </tr>
        <tr>
            <td style="text-align: center;">${seatType}</td>
            <td style="text-align: center;">${seatNumber}</td>
            <td style="text-align: center;">${floor}</td>
            <td style="text-align: center;">${room}</td>
            <td>${startTime}</td>
            <td>${endTime}</td>
        </tr>
    </table>

    <div >
        <h3>Please follow these library guidelines:</h3>
        
        <div class="dos">
            <h4>Do's:</h4>
            <ul>
                <li>Arrive on time for your booking</li>
                <li>Keep your area clean and tidy</li>
                <li>Maintain silence in the reading areas</li>
                <li>Report any issues with your seat to library staff</li>
                <li>Cancel your booking before Start Time of your booking if you cannot attend</li>
                <li>Empty your seat before the end time of your booking</li>
            </ul>
        </div>
        
        <div class="donts">
            <h4>Don'ts:</h4>
            <ul>
                <li>Don't leave your belongings after your booking end time</li>
                <li>Don't consume food or drinks (except water)</li>
                <li>Don't damage library property</li>
                <li>Don't disturb other library users</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p>Thank You</p>
        <p><strong>Nalanda Library</strong><br>
        Indian Institute of Technology Ropar<br>
        Rupnagar, Punjab - 140001</p>
    </div>
</body>
</html>
`;

const pauseBookingsForRoomMailHTML = (name, room, reason, startTime, endTime) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Room Booking Pause Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #1a237e;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #dddddd;
            font-size: 0.9em;
            color: #555555;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th {
            background-color: #e8eaf6;
            color: #1a237e;
            text-align: left;
        }
        th, td {
            border: 1px solid #dddddd;
            padding: 12px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .notification-details {
            background-color: #f9f9f9;
            border: 1px solid #dddddd;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Room Bookings Pause Notification</h2>
    </div>
    
    <p>Dear ${name},</p>

    <p>The bookings for the following room in the library have been temporarily paused:</p>

    <div class="notification-details">
        <table>
            <tr>
                <th>Room</th>
                <td>${room}</td>
            </tr>
            <tr>
                <th>Reason</th>
                <td>${reason}</td>
            </tr>
            <tr>
                <th>Start Time</th>
                <td>${startTime}</td>
            </tr>
            <tr>
                <th>End Time</th>
                <td>${endTime}</td>
            </tr>
        </table>
    </div>

    <p>All the existing bookings in this room during this time period have been cancelled.</p>
    <p>We apologize for any inconvenience this may cause. If you have any questions or need further assistance, please feel free to reach out.</p>

    <div class="footer">
        <p>Thank You</p>
        <p><strong>Nalanda Library</strong><br>
        Indian Institute of Technology Ropar<br>
        Rupnagar, Punjab - 140001</p>
    </div>
</body>
</html>
`;


const bookOverdueFineMailHTML = (name, title, author, dueDate, fineAmount) => `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fine</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book issued to you is overdue on your library account and you have been fined for that.</p>
        <p>Please return the book to avoid any further fines.</p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Due Date</th>
                <th>Fine Amount</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
                <td>${dueDate}</td>
                <td>${fineAmount}</td>
            </tr>
        </table>

        <p> <b> Note: Books returned later beyond due date get overdue fine. An overdue fine is calculated at Rs. 2 per day for 1st week, Rs. 4 per day for 2nd week, Rs. 8 per day for 3rd week so on and so forth. Therefore, avoid overdue fine by renewing or returning the book to the library before the due date. In case of any query or doubts, reply to this email as early as possible. </b> </p>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>
    </body>
    </html>
`

const cancelNotIssuedBookBookingMailHTML = (name, title, author, fineAmount) => `

    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Book Checkout Notification</title>
    </head>
    <body>
        <p>Dear ${name},</p>

        <p>The following book's booking has been cancelled by the library:</p>
        <p>Since the book was not issued within 2 days of booking, you have been fined for the same.</p>

        <table border="1" cellpadding="10">
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Fine Amount</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${author}</td>
                <td>${fineAmount}</td>
            </tr>
        </table>

        <p>Thank you</p>
        <p>Library, IIT Ropar</p>

`

const articleRequestMailHTML = (name, title, authors, journal, publicationYear, DOI) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Article Request Confirmation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #1a237e;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }
            th {
                background-color: #e8eaf6;
                color: #1a237e;
                text-align: left;
            }
            th, td {
                border: 1px solid #dddddd;
                padding: 12px;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Article Request Confirmation</h2>
        </div>
        
        <p>Dear ${name},</p>
        
        <p>We have received your request for the following scholarly article:</p>
        
        <table>
            <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>DOI</th>
                <th>Journal</th>
                <th>Publication Year</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${authors}</td>
                <td>${DOI}</td>
                <td>${journal}</td>
                <td>${publicationYear}</td>
            </tr>
        </table>
        
        <p>Your request has been successfully recorded in our system and is currently being processed. You will receive a notification once the article is available or if additional information is required.</p>
        
        <p>If you have any questions regarding your request, please contact the library helpdesk at <a href="mailto:libraryhelpdesk@iitrpr.ac.in">libraryhelpdesk@iitrpr.ac.in</a>.</p>
        
        <div class="footer">
            <p>Thank You</p>
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;

const articleRequestMailAdminHTML = (name, rollNo, title, authors, journal, publicationYear, DOI) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Article Request Confirmation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #1a237e;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }
            th {
                background-color: #e8eaf6;
                color: #1a237e;
                text-align: left;
            }
            th, td {
                border: 1px solid #dddddd;
                padding: 12px;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>New Article Request</h2>
        </div>
        
        <p>Dear Sir/Madam,</p>
        
        <p>${name} has requested for the following Article:</p>
        
        <table>
            <tr>
                <th>Student Roll Number</th>
                <th>Title</th>
                <th>Authors</th>
                <th>DOI</th>
                <th>Journal</th>
                <th>Publication Year</th>              
            </tr>
            <tr>
                <td>${rollNo}</td>
                <td>${title}</td>
                <td>${authors}</td>
                <td>${DOI}</td>
                <td>${journal}</td>
                <td>${publicationYear}</td>
            </tr>
        </table>
        
        <p>Please look into this request and approve/reject it from the library website.</p>
        
        <div class="footer">
            <p>Thank You</p>
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;

const articleRequestApprovedMailAdminHTML = (rollNo, title, authors, journal, publicationYear, DOI, validTill) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Article Request Approved</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #1a237e;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .important-notice {
                background-color: #e8f5e9;
                border-left: 4px solid #4caf50;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
            .button {
                display: inline-block;
                background-color: #1a237e;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin: 15px 0;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }
            th {
                background-color: #e8eaf6;
                color: #1a237e;
                text-align: left;
            }
            th, td {
                border: 1px solid #dddddd;
                padding: 12px;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Article Request Approved</h2>
        </div>
        
        <p>Dear Sir/Madam</p>
        
        <p>The request for the following article has been successfully approved:</p>
        
        <table>
            <tr>
                <th>Student Roll Number</th>
                <th>Title</th>
                <th>Authors</th>
                <th>DOI</th>
                <th>Journal</th>
                <th>Publication Year</th>
                <th>Access Expiry Time</th>
            </tr>
            <tr>
                <td>${rollNo}</td>
                <td>${title}</td>
                <td>${authors}</td>
                <td>${DOI}</td>
                <td>${journal}</td>
                <td>${publicationYear}</td>
                <td>${validTill}</td>
            </tr>
        </table>
        

        
        <div class="footer">
            <p>Thank You</p>
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;

const articleRequestApprovedMailHTML = (name, title, authors, journal, publicationYear, DOI, validTill) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Article Request Approved</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #1a237e;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .important-notice {
                background-color: #e8f5e9;
                border-left: 4px solid #4caf50;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
            .button {
                display: inline-block;
                background-color: #1a237e;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin: 15px 0;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }
            th {
                background-color: #e8eaf6;
                color: #1a237e;
                text-align: left;
            }
            th, td {
                border: 1px solid #dddddd;
                padding: 12px;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Article Request Approved</h2>
        </div>
        
        <p>Dear ${name},</p>
        
        <p>We are pleased to inform you that your request for the following scholarly article has been approved:</p>
        
        <table>
            <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>DOI</th>
                <th>Journal</th>
                <th>Publication Year</th>
            </tr>
            <tr>
                <td>${title}</td>
                <td>${authors}</td>
                <td>${DOI}</td>
                <td>${journal}</td>
                <td>${publicationYear}</td>
            </tr>
        </table>
        
        <div class="important-notice">
            <p><strong>Important:</strong> The article is now available for you to access on the library website. Please note that your access to this article will expire on <strong>${validTill}</strong>.</p>
        </div>
        
        <p>For any assistance regarding this article or if you need to extend the access period, please contact the library's digital resources team.</p>
        
        <div class="footer">
            <p>Thank You</p>
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;

const complaintMailHTML = (name, title) => `  
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grievance Acknowledgment</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #1a237e;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .complaint-details {
                background-color: #fff3e0;
                border-left: 4px solid #ff9800;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
            .tracking-info {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Grievance Acknowledgment</h2>
        </div>
        
        <p>Dear ${name},</p>
        
        <p>This email confirms that we have received your grievance:</p>
        
        <div>
            <p><strong>Title:</strong> ${title}</p>
        </div>
        
        <p>Your grievance has been registered in our system and forwarded to the appropriate department for review. Our team will investigate the matter thoroughly and provide you with an update as soon as possible.</p>
        
        <div class="tracking-info">
            <p>You can track the status of your grievance by logging into your account on the library website and navigating to the "My Grievances" section.</p>
        </div>
        
        <p>If you need to provide additional information regarding this grievance, please reply to this email or contact the library help desk.</p>
        
        <div class="footer">
            <p>Thank You</p>
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;

const complaintMailAdminHTML = (name, rollNo, title) => `  
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Grievance Registered</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #b71c1c;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .complaint-info {
                background-color: #fbe9e7;
                border-left: 4px solid #e53935;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>New Grievance Received</h2>
        </div>
        
        <p>Dear Library Administrator,</p>
        
        <p>A new grievance has been submitted through the library portal. The details are as follows:</p>
        
        <div class="complaint-info">
            <p><strong>Student's Name:</strong> ${name}</p>
            <p><strong>Student's Roll Number:</strong> ${rollNo}</p>
            <p><strong>Title:</strong> ${title}</p>
        </div>
        
        <p>Please review the grievance and take appropriate action as soon as possible. You can access the full grievance details and manage its status via the admin dashboard.</p>
        
        <p>If further clarification is needed, feel free to reach out to the complainant or mark the grievance for escalation.</p>
        
        <div class="footer">
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;


const feedbackMailHTML = (name, title) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Feedback Acknowledgment</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #1a237e;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .feedback-details {
                background-color: #e1f5fe;
                border-left: 4px solid #03a9f4;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Feedback Acknowledgment</h2>
        </div>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for taking the time to provide us with your valuable feedback:</p>
        
        <div>
            <p><strong>Title:</strong> ${title}</p>
        </div>
        
        <p>We appreciate your input as it helps us improve our services. Your feedback has been forwarded to the appropriate department for review and consideration.</p>
        
        <p>You can check the status of your feedback submission on the library website under "My Feedback" section of your account.</p>
        
        <p>If you have any additional comments or suggestions, please feel free to contact us.</p>
        
        <div class="footer">
            <p>Thank You</p>
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;

const feedbackMailAdminHTML = (name, rollNo, title) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Feedback Received</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #0d47a1;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .feedback-info {
                background-color: #e3f2fd;
                border-left: 4px solid #1976d2;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>New Feedback Submission</h2>
        </div>
        
        <p>Dear Library Administrator,</p>
        
        <p>New feedback has been submitted through the library portal. The details are as follows:</p>
        
        <div class="feedback-info">
            <p><strong>Submitted By:</strong> ${name} (${rollNo})</p>
            <p><strong>Feedback Title:</strong> ${title}</p>
        </div>
        
        <p>Please review the feedback and take necessary action if required. You can access the full feedback and respond via the admin dashboard.</p>
        
        <p>Encouraging regular feedback ensures continual improvement in our library services.</p>
        
        <div class="footer">
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;


const resolvedComplaintMailHTML = (name, title) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grievance Resolution Notification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #1a237e;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .resolution-notice {
                background-color: #e8f5e9;
                border-left: 4px solid #4caf50;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
            .button {
                display: inline-block;
                background-color: #1a237e;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Grievance Resolution Notification</h2>
        </div>
        
        <p>Dear ${name},</p>
        
        <div class="resolution-notice">
            <p>We are pleased to inform you that your grievance regarding <strong>${title}</strong> has been resolved.</p>
        </div>
        
        <p>Our team has addressed the concerns raised in your grievance and has taken appropriate measures to resolve the issue. A detailed resolution report has been added to your grievance record.</p>
        
        <div class="footer">
            <p>Thank You</p>
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;

const resolvedComplaintMailAdminHTML = (name, rollNo, title) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grievance Marked as Resolved</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #2e7d32;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .resolution-info {
                background-color: #f1f8e9;
                border-left: 4px solid #66bb6a;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Grievance Resolved</h2>
        </div>
        
        <p>Dear Library Administrator,</p>
        
        <p>The following grievance has been marked as resolved:</p>
        
        <div class="resolution-info">
            <p><strong>Student's Name:</strong> ${name}</p>
            <p><strong>Student's Roll Number:</strong> ${rollNo}</p>
            <p><strong>Title:</strong> ${title}</p>
        </div>
        
        <p>The grievance status has been updated in the system. You can review the resolution details in the admin dashboard and close the grievance if no further actions are required.</p>
        
        <div class="footer">
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;


const resolvedFeedbackMailHTML = (name, title) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Feedback Response Notification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #1a237e;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .response-notice {
                background-color: #e8f5e9;
                border-left: 4px solid #4caf50;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
            .button {
                display: inline-block;
                background-color: #1a237e;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin: 15px 0;
            }
            .survey {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 4px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Feedback Response Notification</h2>
        </div>
        
        <p>Dear ${name},</p>
        
        <div class="response-notice">
            <p>We are pleased to inform you that we have reviewed and addressed your feedback regarding <strong>${title}</strong>.</p>
        </div>
        
        <p>Our team has carefully considered your suggestions and comments. We have documented our response and any actions taken based on your valuable input.</p>
        
        <div class="footer">
            <p>Thank You</p>
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;

const resolvedFeedbackMailAdminHTML = (name, rollNo, title) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Feedback Marked as Addressed</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                border-bottom: 2px solid #2e7d32;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .resolution-info {
                background-color: #f1f8e9;
                border-left: 4px solid #66bb6a;
                padding: 12px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #dddddd;
                font-size: 0.9em;
                color: #555555;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Feedback Addressed</h2>
        </div>
        
        <p>Dear Library Administrator,</p>
        
        <p>The following feedback has been marked as addressed:</p>
        
        <div class="resolution-info">
            <p><strong>Submitted By:</strong> ${name} (${rollNo})</p>
            <p><strong>Feedback Title:</strong> ${title}</p>
        </div>
        
        <p>The feedback response and any follow-up actions have been documented. You may review the details and archive it from the admin dashboard if no further steps are needed.</p>
        
        <div class="footer">
            <p><strong>Nalanda Library</strong><br>
            Indian Institute of Technology Ropar<br>
            Rupnagar, Punjab - 140001</p>
        </div>
    </body>
    </html>
`;




export {
    verificationMailHTML, 
    resetPasswordMailHTML, 
    approvedRegistrationMailHTML, 
    rejectedRegistrationMailHTML, 
    bookBookedMailHTML, 
    cancelBookBookingMailHTML, 
    issuedBookMailHTML, 
    rejectIssueBookMailHTML, 
    returnBookMailHTML, 
    renewBookMailHTML,
    advanceBookDueDateReminderMailHTML,
    bookDueDateReminderMailHTML,
    seatBookedMailHTML,
    cancelSeatBookingMailHTML,
    rejectSeatBookingMailHTML,
    upcomingSeatBookingMailHTML,
    endingSeatBookingMailHTML,
    pauseBookingsForRoomMailHTML,
    bookOverdueFineMailHTML,
    cancelNotIssuedBookBookingMailHTML,
    articleRequestMailHTML,
    articleRequestMailAdminHTML,
    articleRequestApprovedMailHTML, 
    articleRequestApprovedMailAdminHTML,
    complaintMailHTML,
    feedbackMailHTML, 
    resolvedComplaintMailHTML,
    resolvedFeedbackMailHTML,
    complaintMailAdminHTML,
    feedbackMailAdminHTML,
    resolvedComplaintMailAdminHTML,
    resolvedFeedbackMailAdminHTML,
}
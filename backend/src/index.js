import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from './app.js'
import { Server } from "socket.io"; // Import socket.io
import http from "http"; // Import http to create a server

dotenv.config({
    path: './.env'
});

const server = http.createServer(app);

// Initialize socket.io with the HTTP server
const io = new Server(server, {
  cors: {
    origin: [process.env.CORS_ORIGIN1,process.env.CORS_ORIGIN2],
    credentials: true,
  },
});

io.on("connection", (socket) => {
    console.log("A user connected");
  
    socket.on("seatSelected", (data) => {
      // Broadcast to all clients except the sender
      socket.broadcast.emit("seatSelected", data);
    });
  
    socket.on("seatBooked", (data) => {
      // Broadcast to all clients
      io.emit("seatBooked", data);
    });

    socket.on("seatDeselected", (data) => {
        io.emit("seatDeselected", data);
      });
  
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

connectDB()
    .then(() => {
        server.listen(process.env.PORT || 3000, () => {
            console.log(`⚙️ Server is running at port: ${process.env.PORT || 3000}`);
            console.log(`WebSocket server is also running on ws://localhost:${process.env.PORT || 3000}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })

const express = require("express");
const http = require("http"); // Added for Socket.IO
const socketIo = require("socket.io"); // Added for WebSockets
const pool = require("./db");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const { geoApi } = require("./geoapi.js");

const PORT = process.env.PORT || 5555;

const app = express();
const server = http.createServer(app); // Wrap app in HTTP server for Socket.IO
const io = socketIo(server, { // Initialize Socket.IO
  cors: {
    origin: "*", // Allow your frontend; restrict in production
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

app.use(cors({
    origin: "*"
}));

app.use(express.static(path.join(__dirname, "driver")));
app.use(express.static(path.join(__dirname, "admin")));

// Routes
const AdminRoutes = require("./routes/AdminRoute.js");
const StudentRoutes = require("./routes/StudentRoute.js");
const DriverRoutes = require("./routes/DriverRoute.js");

// API Endpoints

// Admin
app.use("/admin", AdminRoutes);

// Student
app.use("/student", StudentRoutes);

// Driver
app.use("/driver", DriverRoutes);

// WebSocket connections for real-time tracking
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Student subscribes to a driver's updates (based on driver_id)
  socket.on('subscribe-driver', (driverId) => {
    socket.join(`driver-${driverId}`);
    console.log(`User ${socket.id} subscribed to driver-${driverId}`);
    // Optionally, send current location on subscribe
    pool.query("SELECT latitude, longitude, updated_at FROM driver_live_location WHERE driver_id = $1", [driverId])
      .then(result => {
        if (result.rows.length > 0) {
          socket.emit('location-update', result.rows[0]);
        }
      })
      .catch(err => console.error('Error fetching initial location:', err));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io for use in controllers
module.exports.io = io;

app.get("/geoapi", async (req, res) => {
  try {
    const geo = await geoApi(); // Await result
    if (geo) {
      res.json(geo);
    } else {
      res.status(500).json({ error: "Failed to fetch geo data" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/db", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");
    console.log("DB Connected");
    return res.send("DB Connected");
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "database failed",
    });
  }
});

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Bus Management System</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>🚌 Automated Bus Management System </h1>
        <p>Server is running successfully!</p>
        <h3>Available Routes:</h3>
        <ul style="list-style: none;">
          <li><a href="/driver.html">🚗 Driver Tracking</a></li>
          <li><a href="/studenttracking.html">👨‍💼 Student Tracking</a></li>
          <li><a href="/attendance.html">👨‍🎓 Student Portal</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Use server.listen instead of app.listen for Socket.IO support
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server with WebSockets running on port ${PORT}`);
});

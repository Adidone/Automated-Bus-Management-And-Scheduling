const express = require("express");
const pool = require("./db");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const { geoApi } = require("./geoapi.js");

const PORT = process.env.PORT || 5555;

const app = express();
app.use(express.json());

app.use(cors({
    origin: "*"
}));

// ✅ IMPORTANT: Serve static files from driver and admin folders
app.use(express.static(path.join(__dirname, "driver")));
app.use(express.static(path.join(__dirname, "admin")));

//routes
const AdminRoutes = require("./routes/AdminRoute.js");
const StudentRoutes = require("./routes/StudentRoute.js");
const DriverRoutes = require("./routes/DriverRoute.js");

//api-endpoints

//admin
app.use("/admin", AdminRoutes);

//student
app.use("/student", StudentRoutes);

//driver
app.use("/driver", DriverRoutes);

// ✅ ADD THIS: Serve attendance page
app.get("/attendance", (req, res) => {
  res.sendFile(path.join(__dirname, "driver", "attendance.html"));
});

app.get("/geoapi", async (req, res) => {
  try {
    const geo = await geoApi();
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
      <head>
        <title>Bus Management System</title>
        <style>
          body {
            font-family: Arial;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
          }
          .container {
            background: white;
            padding: 50px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 30px; }
          .link-box {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          a {
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 18px;
            transition: transform 0.3s;
          }
          a:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 16px rgba(102,126,234,0.4);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚌 Automated Bus Management System</h1>
          <p>Server is running successfully!</p>
          <div class="link-box">
            <a href="/driver.html">🚗 Driver Tracking</a>
            <a href="/admin">👨‍💼 Admin Panel</a>
            <a href="/attendance">👨‍🎓 Mark Attendance</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
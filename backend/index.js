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

app.use(express.static(path.join(__dirname, "driver")));
app.use(express.static(path.join(__dirname, "admin")))

//routes
const AdminRoutes = require("./routes/AdminRoute.js")
const StudentRoutes = require("./routes/StudentRoute.js");
const DriverRoutes = require("./routes/DriverRoute.js");

//api-endpoints

//admin
app.use("/admin",AdminRoutes);

//student
app.use("/student",StudentRoutes)

//driver
app.use("/driver",DriverRoutes);



app.get("/geoapi", async (req, res) => {
  try {
    const geo = await geoApi(); // ✅ Await result
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
          <li><a href="/admin">👨‍💼 Admin Panel</a></li>
          <li><a href="/attendance.html">👨‍🎓 Student Portal</a></li>
        </ul>
      </body>
    </html>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

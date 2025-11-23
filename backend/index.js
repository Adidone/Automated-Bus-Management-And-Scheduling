const express = require("express");
const pool = require("./db");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const https = require("https");
const fs = require("fs");

const { geoApi } = require("./geoapi.js");

const options = {
  key: fs.readFileSync("localhost+1-key.pem"),
  cert: fs.readFileSync("localhost+1.pem")
};

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

https.createServer(options, app).listen(5555, () => {
  console.log("✅ HTTPS Server running on https://localhost:5555");
  console.log("✅ Also accessible on https://10.222.218.121:5555");
});

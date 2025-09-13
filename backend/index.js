const express = require("express");
const pool = require("./db");
require("dotenv").config();
const cors = require("cors");

const { geoApi } = require("./geoapi.js");

const app = express();
app.use(express.json());
app.use(cors());

//routes
const AdminRoutes = require("./routes/AdminRoute.js")

//api-endpoints
app.use("/admin",AdminRoutes);






























































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

app.listen(5555, () => {
  console.log("Server is running on 5555");
});

const pool = require("../../db");
const { getToken } = require("../../GetToken");
const axios = require("axios");
require("dotenv").config();

const MMI_API_KEY = process.env.MMI_API_KEY;

const AddRoute = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, start_stop_id, end_stop_id } = req.body;

    await client.query('BEGIN');
    
    if (!name || !start_stop_id || !end_stop_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: "All fields are required (name, start_stop_id, end_stop_id)",
        success: false,
      });
    }

    
    const existingRoute = await client.query(
      "SELECT * FROM routes WHERE name = $1",
      [name]
    );
    if (existingRoute.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: "Route with this name already exists",
        success: false,
      });
    }

   
    const start = await client.query(
      "SELECT latitude, longitude, name FROM stops WHERE id = $1",
      [start_stop_id]
    );
    const end = await client.query(
      "SELECT latitude, longitude, name FROM stops WHERE id = $1",
      [end_stop_id]
    );

    if (start.rows.length === 0 || end.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: "Invalid start or end stop ID",
        success: false,
      });
    }

    const startCoords = `${start.rows[0].longitude},${start.rows[0].latitude}`;
    const endCoords = `${end.rows[0].longitude},${end.rows[0].latitude}`;

    console.log(` Start: ${startCoords}`);
    console.log(` End: ${endCoords}`);

    
    const token = await getToken();
    if (!token) {
      await client.query('ROLLBACK');
      return res.status(500).json({ message: "Failed to get MMI token" });
    }

    
    const url = `https://apis.mapmyindia.com/advancedmaps/v1/${MMI_API_KEY}/route_adv/driving/${startCoords};${endCoords}?geometries=polyline&overview=full`;
    console.log("MMI API URL:", url);

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error("No route found for these stops");
    }

    const routeData = response.data.routes[0];
    const totalDistance = (routeData.distance / 1000).toFixed(2);

    console.log(" Total Distance (km):", totalDistance);

  
    const addRouteQuery = `
      INSERT INTO routes (name, start_stop_id, end_stop_id, total_distance)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const result = await client.query(addRouteQuery, [
      name,
      start_stop_id,
      end_stop_id,
      totalDistance,
    ]);

    const newRoute = result.rows[0];
    await client.query('COMMIT')
    return res.status(201).json({
      message: "Route added successfully",
      route: newRoute,
      success: true,
    });
  } catch (error) {
    console.error("Error adding route:", error.message);

    if (error.response) {
      await client.query('ROLLBACK');
      console.error("MMI API Error:", error.response.data);
      return res.status(error.response.status).json({
        message: error.response.data.error || "Error with MMI API",
        success: false,
      });
    }
    await client.query('ROLLBACK');
    res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

module.exports = AddRoute;

const pool = require("../../db");

const DriverTrip = async (req, res) => {
  try {
    const { id } = req.body; // driver_id
    if (!id) {
      return res.status(400).json({
        message: "Please provide driver id",
        success: false
      });
    }

    // Step 1: Find the trip for this driver
    const tripResult = await pool.query(
      "SELECT * FROM trips WHERE driver_id = $1",
      [id]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({
        message: "No trip found for this driver",
        success: false
      });
    }

    const route_id = tripResult.rows[0].route_id;

    // Step 2: Fetch stops for that route with their distance & coordinates
    const routeStops = await pool.query(`
      SELECT 
        rs.stop_order,
        rs.distance_from_previous_stop,
        s.name AS stop_name,
        s.latitude,
        s.longitude
      FROM route_stops rs
      JOIN stops s ON rs.stop_id = s.id
      WHERE rs.route_id = $1
      ORDER BY rs.stop_order ASC
    `, [route_id]);

    if (routeStops.rows.length === 0) {
      return res.status(404).json({
        message: "No stops found for this route",
        success: false
      });
    }

    // Step 3: Format response data
    const stops = routeStops.rows.map(stop => ({
      order: stop.stop_order,
      name: stop.stop_name,
      lat: stop.latitude,
      lng: stop.longitude,
      distance_from_prev_km: stop.distance_from_previous_stop || 0
    }));

    // Step 4: Send response
    return res.status(200).json({
      message: "Driver trip route data fetched successfully",
      success: true,
      route_id,
      stops
    });

  } catch (error) {
    console.error("Error in DriverTrip:", error);
    return res.status(500).json({
      message: error.message,
      success: false
    });
  }
};

module.exports = DriverTrip;

const axios = require("axios");
require("dotenv").config();

const MMI_API_KEY = process.env.MMI_API_KEY;

/**
 * Get distance & duration using MapMyIndia Directions API
 * @param {Array} start [lon, lat]
 * @param {Array} end [lon, lat]
 */
async function getMMIRoute(start, end) {
  try {
    // MapMyIndia expects lat,lng format (NOT lng,lat like ORS)
    const url = `https://apis.mapmyindia.com/advancedmaps/v1/${MMI_API_KEY}/route_adv/driving/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=polyline`;

    const response = await axios.get(url);

    if (response.data.routes && response.data.routes.length > 0) {
      const summary = response.data.routes[0].summary;
      return {
        distance_km: (summary.distance / 1000).toFixed(2),
        duration_min: (summary.duration / 60).toFixed(2),
        polyline: response.data.routes[0].geometry // you can send this to frontend map
      };
    } else {
      console.error("No route found");
      return null;
    }
  } catch (err) {
    console.error("MapMyIndia API Error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = { getMMIRoute };

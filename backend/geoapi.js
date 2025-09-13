const axios = require("axios");
const { getToken } = require("./mmiService");

async function geoApi() {
  try {
    const token = await getToken();
    if (!token) throw new Error("No token available");

    const url = "https://atlas.mapmyindia.com/api/places/geocode?address=Mumbai";
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (err) {
    console.error("MMI API Error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = { geoApi };

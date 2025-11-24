import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import axios from "axios";
import { useEffect, useState } from "react";
import L from "leaflet";

function App() {
  const [routeCoords, setRouteCoords] = useState([]);

  const stops = [
    [16.57616197, 74.29479831], // STOP ID 6 - HOME
    [16.58377964, 74.30980429], // STOP ID 7 - KAGAL 1ST STOP
    [16.62039870, 74.29770568], // STOP ID 8 - KANERI STOP
    [16.63783643, 74.27932786], // STOP ID 9 - GOKUL SHIRGAV
    [16.65451617, 74.26181243]  // STOP ID 1 - KIT
  ];

  // ✅ Bus Icon
  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61212.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await axios.post(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            coordinates: stops.map(s => [s[1], s[0]])
          },
          {
            headers: {
              "Authorization": import.meta.env.VITE_ORS_API_KEY,
              "Content-Type": "application/json"
            }
          }
        );

        const coords = res.data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRouteCoords(coords);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRoute();
  }, []);

  return (
    <MapContainer center={stops[0]} zoom={12} scrollWheelZoom={true} style={{ height: "100vh" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* ✅ Stop Markers */}
      {stops.map((stop, i) => (
        <Marker key={i} position={stop} />
      ))}

      {/* ✅ Real Road Route */}
      {routeCoords.length > 0 && (
        <Polyline positions={routeCoords} color="blue" weight={5} />
      )}

      {/* ✅ BUS STARTING POSITION */}
      {routeCoords.length > 0 && (
        <Marker position={routeCoords[0]} icon={busIcon} />
      )}
    </MapContainer>
  );
}

export default App;

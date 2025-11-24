
const express = require("express");
const AddDriver = require("../controllers/Driver/AddDriver.js");
const StopStudents = require("../controllers/Driver/StopStudents.js");
const DriverTrip = require(".././controllers/Driver/DriverTrip.js");
const UpdateLocation = require("../controllers/Driver/UpdateLocation.js");
const GetETA = require("../controllers/Driver/GetEta.js");
const ResetRoute = require("../controllers/Driver/ResetRoute.js");
const GetCompletedStops = require("../controllers/Driver/GetCompletedStops.js");
const GetLiveLocations = require("../controllers/Driver/GetLiveLocations.js");
const ClearCompletedStops = require("../controllers/Driver/ClearCompletedStops.js");
const router = express.Router();

router.post("/add",AddDriver);
router.post("/stopstudents",StopStudents);
router.post("/driver-route",DriverTrip);
router.post("/update-location", UpdateLocation);
router.get("/eta/:driverId", GetETA);
router.post("/reset-route", ResetRoute);
router.get("/completed-stops/:driverId", GetCompletedStops);
router.get("/location/:driverId", GetLiveLocations);
router.get("/clear-completed-stops/:driverId", ClearCompletedStops);

module.exports = router;
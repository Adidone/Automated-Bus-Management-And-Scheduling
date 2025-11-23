
const express = require("express");
const AddDriver = require("../controllers/Driver/AddDriver.js");
const StopStudents = require("../controllers/Driver/StopStudents.js");
const DriverTrip = require(".././controllers/Driver/DriverTrip.js");
const UpdateLocation = require("../controllers/Driver/UpdateLocation.js");
const router = express.Router();

router.post("/add",AddDriver);
router.post("/stopstudents",StopStudents);
router.post("/driver-route",DriverTrip);
router.post("/update-location", UpdateLocation);

module.exports = router;

const express = require("express");
const AddDriver = require("../controllers/Driver/AddDriver.js");
const StopStudents = require("../controllers/Driver/StopStudents.js");
const DriverTrip = require(".././controllers/Driver/DriverTrip.js")
const router = express.Router();

router.post("/add",AddDriver);
router.post("/stopstudents",StopStudents);
router.post("/driver-route",DriverTrip);

module.exports = router;
const express = require("express")
const router = express.Router();
const AdminLogin = require("../controllers/Admin/AdminLogin.js")
const AddBus = require("../controllers/Admin/AddBus.js");
const AddRoute = require("../controllers/Admin/AddRoute.js");
const AddDriver = require("../controllers/Driver/AddDriver.js");
const AddTrip = require("../controllers/Admin/AddTrip.js");
const AddStop = require("../controllers/Admin/AddStop.js");
const AddRouteStop = require("../controllers/Admin/AddRouteStop.js");
const LiveTrips = require("../controllers/Admin/LiveTrips.js");
const GetBuses = require("../controllers/Admin/GetBuses.js");
const GetRoutes = require("../controllers/Admin/GetRoutes.js");
const GetDrivers = require("../controllers/Admin/GetDrivers.js");
const GetStops = require("../controllers/Admin/GetStops.js");
const GetStudents = require("../controllers/Admin/GetStudents.js");
const AddStudent = require("../controllers/Student/AddStudent.js");

router.post("/login", AdminLogin);
router.post("/addbus", AddBus);
router.post("/addroute", AddRoute);
router.post("/adddriver", AddDriver);
router.post("/addtrip", AddTrip);
router.post("/addstop", AddStop);
router.post("/routes-stop", AddRouteStop);
router.post("/addstudent", AddStudent);
router.get("/livetrips", LiveTrips);
router.get("/buses", GetBuses);
router.get("/routes", GetRoutes);
router.get("/drivers", GetDrivers);
router.get("/stops", GetStops);
router.get("/students", GetStudents);

module.exports = router;
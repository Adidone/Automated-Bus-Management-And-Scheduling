
const express = require("express");
const AddStudent = require("../controllers/Student/AddStudent");
const MarkAttendance = require("../controllers/Student/MarkAttendance");
const GetDriverInfo = require("../controllers/Student/GetDriverInfo");
const GetStudentInfo = require("../controllers/Student/GetStudentInfo");
const GetAttendanceStatus = require("../controllers/Student/GetAttendanceStatus");
const GetProfile = require("../controllers/Student/GetProfile");
const GetRouteStops = require("../controllers/Student/GetRouteStops");
const GetDriverLiveLocation = require("../controllers/Student/GetDriverLiveLocation");
const router = express.Router();

router.post("/add",AddStudent);
router.post("/mark-attendance", MarkAttendance);
router.get("/info/:studentId", GetStudentInfo);

// Get driver assigned to student's route
router.get("/driver-info/:studentId", GetDriverInfo);

// Get today's attendance status
router.get("/attendance-status/:studentId", GetAttendanceStatus);

router.get("/profile/:id", GetProfile);
router.get("/route-stops/:route_id", GetRouteStops);
router.get("/live-location/:driverId", GetDriverLiveLocation);


module.exports = router;
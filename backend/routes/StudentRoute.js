
const express = require("express");
const AddStudent = require("../controllers/Student/AddStudent");
const MarkAttendance = require("../controllers/Student/MarkAttendance");
const GetDriverInfo = require("../controllers/Student/GetDriverInfo");
const GetStudentInfo = require("../controllers/Student/GetStudentInfo");
const GetAttendanceStatus = require("../controllers/Student/GetAttendanceStatus");
const router = express.Router();

router.post("/add",AddStudent);
router.post("/mark-attendance", MarkAttendance);
router.get("/info/:studentId", GetStudentInfo);

// Get driver assigned to student's route
router.get("/driver-info/:studentId", GetDriverInfo);

// Get today's attendance status
router.get("/attendance-status/:studentId", GetAttendanceStatus);


module.exports = router;
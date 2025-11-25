
const express = require("express");
const AddStudent = require("../controllers/Student/AddStudent");
const MarkAttendance = require("../controllers/Student/MarkAttendance");
const StudentLiveTracking = require("../controllers/Student/StudentLiveTracking");
const router = express.Router();

router.post("/add",AddStudent);
router.post("/mark-attendance", MarkAttendance);
router.get("live-tracking/:student_id",StudentLiveTracking)

module.exports = router;
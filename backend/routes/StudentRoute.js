
const express = require("express");
const AddStudent = require("../controllers/Student/AddStudent");
const MarkAttendance = require("../controllers/Student/MarkAttendance");
const router = express.Router();

router.post("/add",AddStudent);
router.post("/mark-attendance", MarkAttendance);

module.exports = router;
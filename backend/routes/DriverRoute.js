
const express = require("express");
const AddDriver = require("../controllers/Driver/AddDriver.js");
const StopStudents = require("../controllers/Driver/StopStudents.js");
const router = express.Router();

router.post("/add",AddDriver);
router.post("/stopstudents",StopStudents);

module.exports = router;
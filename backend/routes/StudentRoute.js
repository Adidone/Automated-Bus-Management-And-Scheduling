
const express = require("express");
const AddStudent = require("../controllers/Student/AddStudent");
const router = express.Router();

router.post("/add",AddStudent);

module.exports = AddStudent;
const express = require("express")
const router = express.Router();
const AdminLogin = require("../controllers/Admin/AdminLogin.js")


router.post("/login",AdminLogin);

module.exports = router;
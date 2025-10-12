const express = require("express")
const router = express.Router();
const AdminLogin = require("../controllers/Admin/AdminLogin.js")
const AddBus = require("../controllers/Admin/AddBus.js");
const AddRoute = require("../controllers/Admin/AddRoute.js");
const AddDriver = require("../controllers/Driver/AddDriver.js");
const AddTrip = require("../controllers/Admin/AddTrip.js");

router.post("/login",AdminLogin);
router.post("/addbus",AddBus);
router.post("/addroute",AddRoute);
router.post("/adddriver",AddDriver);
router.post("/addtrip",AddTrip);

module.exports = router;
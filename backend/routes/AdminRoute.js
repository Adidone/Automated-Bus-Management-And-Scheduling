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

router.post("/login",AdminLogin);
router.post("/addbus",AddBus);
router.post("/addroute",AddRoute);
router.post("/adddriver",AddDriver);
router.post("/addtrip",AddTrip);
router.post("/addstop",AddStop);
router.post("/routes-stop",AddRouteStop);
router.get("/livetrips",LiveTrips);

module.exports = router;
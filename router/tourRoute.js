const express = require("express");
const {
  getTours,
  createMultipleTour,
  aliasTopTours,
  getTourStats,
  getMonthPlan,
  createTour,
  updateTour,
} = require("../controllers/tourCtrl");
const router = express.Router();
router.route("/stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthPlan);
router.route("/top-5-cheap").get(aliasTopTours, getTours);
router.route("/").get(getTours).post(createTour);
router.route("/:id").patch(updateTour);
module.exports = router;

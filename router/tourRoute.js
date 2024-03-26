const express = require("express");
const {
  getTours,
  aliasTopTours,
  getTourStats,
  getMonthPlan,
  createTour,
  updateTour,
  getTourById,
  deleteTour,
} = require("../controllers/tourCtrl");
const { protect, restrictTo } = require("../controllers/authControler");
const reviewRouter = require("./../router/reviewRoute");
const router = express.Router();
router.use("/:tourId/review", reviewRouter);
router.route("/stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthPlan);
router.route("/top-5-cheap").get(aliasTopTours, getTours);
router.route("/").get(getTours).post(createTour);
router
  .route("/:id")
  .get(getTourById)
  .patch(updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;

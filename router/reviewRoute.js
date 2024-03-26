const express = require("express");
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
} = require("../controllers/reviewControler");
const { protect, restrictTo } = require("../controllers/authControler");
const router = express.Router({ mergeParams: true });
router.use(protect);
router
  .route("/")
  .get(getAllReviews)
  .post(restrictTo("user"), setTourUserIds, createReview);

router
  .route("/:id")
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), deleteReview);
module.exports = router;

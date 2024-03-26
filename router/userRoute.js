const express = require("express");
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require("../controllers/authControler");
const {
  getAllUSer,
  deleteUser,
  updateMe,
  deleteMe,
} = require("../controllers/userControler");
const router = express.Router();
router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/resetPassword/:token").patch(resetPassword);
router.route("/updatePassword").patch(protect, updatePassword);
router.route("/updateMe").patch(protect, updateMe);
router.route("/deleteMe").delete(protect, deleteMe);
router.route("/").get(getAllUSer);
router.route("/:id").delete(deleteUser);

module.exports = router;

const express = require("express")
const { getTours, createMultipleTour, aliasTopTours, getTourStats } = require("../controllers/tourCtrl")
const router = express.Router()
router.route('/stats').get(getTourStats)
router.route('/top-5-cheap').get(aliasTopTours,getTours)
router.route("/").get(getTours).post(createMultipleTour)

module.exports = router
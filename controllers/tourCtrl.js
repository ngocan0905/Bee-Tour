const Tour = require("../models/tourModel");
const fs = require("fs");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handleFactory");
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,ratingsAverage";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getTours = factory.getAll(Tour);
exports.getTourById = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
exports.getMonthPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});

// exports.importMultiTour = catchAsync(async (req, res, next) => {
//   const tour = fs.readFileSync(`${__dirname}/../test/tourData.json`);
//   const data = JSON.parse(tour);
//   const tours = await Tour.create(data);
//   res.json(tours);
// });

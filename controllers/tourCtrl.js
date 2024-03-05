const Tour = require("../models/tourModel");
const fs = require("fs");
const APIFeatures = require("../utils/apiFeatures");
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,ratingsAverage";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getTours = async (req, res) => {
  try {
    // execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // send response
    res.json({
      status: "successfully",
      result: tours.length,
      data: tours,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.stack,
    });
  }
};
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};
exports.createMultipleTour = async (req, res) => {
  try {
    const rawData = fs.readFileSync(`${__dirname}/../test/tourData.json`);
    const toursData = JSON.parse(rawData);
    const createTours = await Promise.all(
      toursData.map(async (tourData) => {
        return await Tour.create(tourData);
      })
    );
    res.json({
      status: "successfully",
      result: createTours.length,
      tours: createTours,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

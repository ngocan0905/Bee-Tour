const mongoose = require("mongoose");
const slugify = require("slugify");
// Declare the Schema of the Mongo model
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, " a tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "a tour must have less or equal then 40 characters"],
      minlength: [10, "a tour must have more or equal then 10 charaters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "a tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "a tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "a tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "hard"],
        message: "difficulty is either: easy, medium, hard",
      },
    },
    ratingsAverage: {
      type: Number,
      min: [1, "rating must be above 1.0"],
      max: [5, "rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, "a tour must have a price"],
    },
    priceDisscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // chỉ có tác dụng với việc tạo mới
          return val < this.price;
        },
        // Ở mongodb được phép dùng ~~VALUE~~ đẻ trỏ đến tham số ~~val~~ của hàm trên
        message: "disscount price ({VALUE}) should be below than price",
      },
    },
    summary: {
      type: String,
      required: [true, "a tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "a tour must have a cover image"],
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', function(next){
//   console.log('will save document');
//   next()
// })
// tourSchema.post('save', function(doc,next){
//   console.log(doc);
//   next()
// })
// query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});
// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
// Export the model
module.exports = mongoose.model("Tour", tourSchema);

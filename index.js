require("dotenv").config({ path: "./config.env" });
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const app = express();
const dbConnect = require("./configs/dbConnect");
const morgan = require("morgan");
// global middlewares
// set security http headers
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limit request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "too many request from thi id. please try again in an hour ",
});
app.use("/api", limiter);
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
// body-parser
app.use(express.json());
//
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorControler");
const tourRouter = require("./router/tourRoute");
const userRouter = require("./router/userRoute");
const reviewRouter = require("./router/reviewRoute");
const { PORT } = process.env;
dbConnect();

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tour", tourRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/review", reviewRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
app.listen(PORT, () =>
  console.log(`server is running at http://localhost:${PORT}`)
);

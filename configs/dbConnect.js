const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD),
      {
        dbName: "BeeTour",
      }
    );
    console.log("Database connected successfully");
  } catch (error) {
    console.log("error");
    console.error(error.name, error.message);
  }
};

module.exports = dbConnect;

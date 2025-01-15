const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const URI = process.env.NODE_ENV === "test" ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;

    await mongoose.connect(URI);
  } catch (error) {
    console.error("DB Connection Error: ", error);
    process.exit(1);
  }
};

module.exports = connectDB;

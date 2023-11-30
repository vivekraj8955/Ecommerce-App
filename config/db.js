import mongoose from "mongoose";

import colors from "colors";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `connected to mongodbDatabase : ${conn.connection.host}`.bgGreen
    );
  } catch (error) {
    console.log(`error: ${error.message}`.bgRed);
  }
};

export default connectDb;

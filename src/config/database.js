const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://vipul1:vipul123@authapp.hz2n5r9.mongodb.net/devTinder"
    );
    console.log("Database connected:", conn.connection.host);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

module.exports = { connectDB };

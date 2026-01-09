import { MongoClient } from "mongodb";
import DB_NAME from "../constant.js";

const connectDB = async () => {
  try {
    const client = new MongoClient(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    await client.connect();

    console.log("✅ MONGO DB CONNECTED SUCCESSFULLY!!", client);

    return client.db(DB_NAME); // return DB instance if needed
  } catch (error) {
    console.log("❌ MONGO DB CONNECTION FAILED!!", error);
    process.exit(1);
  }
};

export default connectDB;

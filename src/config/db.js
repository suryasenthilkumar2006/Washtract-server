import mongoose from 'mongoose';

/**
 * What is Mongoose?
 * Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js.
 * We use it over the raw MongoDB driver because it provides a schema-based 
 * solution to model your application data. It includes built-in type 
 * casting, validation, and query building, making code much cleaner.
 */

const connectDB = async () => {
  try {
    // Attempt to connect using the URI stored in your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    /**
     * Connection Host Log
     * 'conn.connection.host' tells us exactly which database cluster 
     * we are talking to (e.g., cluster0-shard-00-00.mongodb.net). 
     * This is useful for verifying if you're connected to your 
     * local DB or your production Atlas instance.
     */
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);

    /**
     * Why process.exit(1)?
     * 'process.exit()' tells Node.js to stop the script immediately. 
     * The '1' is a status code meaning "Exit with failure." 
     * Since WashTrack cannot function without its database, there is 
     * no point in running the server if the connection fails.
     */
    process.exit(1);
  }
};

export default connectDB;

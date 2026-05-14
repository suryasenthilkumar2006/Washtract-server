import mongoose from 'mongoose';

/**
 * What is a Mongoose Schema?
 * A Schema is a blueprint that defines the structure of the documents 
 * within a MongoDB collection. While MongoDB is "schemaless" by nature, 
 * Mongoose Schemas allow us to enforce data rules, types, and defaults 
 * at the application level.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  room: {
    type: String,
    required: [true, 'Please add a room number or identifier']
  },
  /**
   * Why is the PIN stored as a String?
   * Even though a PIN is usually digits (e.g., 1234), we store it as a String 
   * because it will be transformed into a long, alphanumeric hash using 
   * a library like bcrypt. Storing it as a String also prevents the loss 
   * of leading zeros.
   */
  pin: {
    type: String,
    required: [true, 'Please add a PIN'],
    minlength: 4
  },
  /**
   * What does 'enum' do?
   * Enum (short for enumeration) acts as a validator that restricts the 
   * value of this field to a specific list of strings. In this case, 
   * a user can ONLY be a 'resident' or an 'admin'.
   */
  role: {
    type: String,
    enum: ['resident', 'admin'],
    default: 'resident'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Schema vs. Model: The Difference
 * - The Schema (defined above) is the "map" or the "rules."
 * - The Model (defined below) is a "class" constructed from the Schema. 
 *   The Model provides the interface to the database for creating, 
 *   querying, updating, and deleting documents (CRUD).
 */
const User = mongoose.model('User', userSchema);

export default User;
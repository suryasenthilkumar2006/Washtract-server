import mongoose from 'mongoose';

/**
 * Machine Schema
 * This defines how every washing machine is represented in the database.
 * It directly maps to the 'DEMO_MACHINES' used in your React frontend,
 * ensuring the data types match for seamless state management.
 */
const machineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Machine name is required'],
    trim: true
  },
  floor: {
    type: String,
    required: [true, 'Floor location is required']
  },
  /**
   * Enum for Status
   * Limits the status to the specific states your UI can handle.
   * Maps to the colors/icons used in your mobile-first frontend.
   */
  status: {
    type: String,
    enum: ['free', 'inuse', 'delayed', 'fault', 'paused'],
    default: 'free'
  },
  /**
   * Current User Data
   * Why store name and room directly instead of just userId?
   * In a high-traffic PG app, we often want to show "Used by: John (Room 201)" 
   * without doing a second database lookup (a "Join" or "Populate"). 
   * This 'denormalization' makes the read-speed much faster for the dashboard.
   */
  currentUser: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    name: { type: String, default: '' },
    room: { type: String, default: '' }
  },
  /**
   * What Default Values Do
   * In Mongoose, 'default' ensures that if a field isn't provided when 
   * creating a machine, the database fills it automatically. 
   * This prevents 'undefined' errors in your React components.
   */
  remainingTime: {
    type: Number,
    default: 0 // Stored in seconds for easy countdown logic
  },
  totalTime: {
    type: Number,
    default: 0
  },
  reports: {
    type: Number,
    default: 0 // For tracking machine issues
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

/**
 * What is ObjectId 'ref'?
 * The 'ref' property tells Mongoose which model to use during 'population'.
 * While MongoDB is non-relational, 'ref' allows us to link a Machine 
 * document to a User document, similar to a Foreign Key in SQL.
 */
const Machine = mongoose.model('Machine', machineSchema);

export default Machine;
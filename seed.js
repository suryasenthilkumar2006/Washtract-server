import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Machine from './src/models/Machine.js';

dotenv.config();

const initialMachines = [
  {
    name: "Machine A",
    floor: "Ground Floor",
    status: "free",
    currentUser: { userId: null, name: "", room: "" },
    remainingTime: 0,
    totalTime: 0,
    reports: 0
  },
  {
    name: "Machine B",
    floor: "Ground Floor",
    status: "free",
    currentUser: { userId: null, name: "", room: "" },
    remainingTime: 0,
    totalTime: 0,
    reports: 0
  },
  {
    name: "Machine C",
    floor: "2nd Floor",
    status: "free",
    currentUser: { userId: null, name: "", room: "" },
    remainingTime: 0,
    totalTime: 0,
    reports: 0
  },
  {
    name: "Machine D",
    floor: "3rd Floor",
    status: "free",
    currentUser: { userId: null, name: "", room: "" },
    remainingTime: 0,
    totalTime: 0,
    reports: 0
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    console.log('Clearing existing machines...');
    await Machine.deleteMany({});

    console.log('Inserting machines...');
    const inserted = await Machine.insertMany(initialMachines);
    console.log(`✅ Seeded ${inserted.length} machines successfully!`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedDatabase();
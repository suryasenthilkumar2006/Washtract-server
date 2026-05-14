import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

/**
 * Helper: Generate JWT
 * @param {string} id - The MongoDB user ID
 * 
 * What is a JWT Payload?
 * It is the data "encoded" inside the token. Here, we store the user ID 
 * so that when the user sends the token back, we know exactly who they are.
 * 
 * What does expiresIn do?
 * It sets the lifespan of the token. '30d' means the resident won't have 
 * to log in again for 30 days unless they clear their cache or the token is revoked.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, room, pin, role } = req.body;

  try {
    const userExists = await User.findOne({ room });

    if (userExists) {
      return res.status(400).json({ message: 'Room already registered' });
    }

    /**
     * What is Bcrypt Hashing?
     * Hashing turns a plain-text PIN (e.g., "1234") into a complex string 
     * that cannot be reversed. Storing plain text is dangerous because if 
     * your database is leaked, every resident's PIN is exposed.
     * 
     * Salt Rounds (10):
     * The "salt" is random data added to the input. 10 rounds mean the 
     * algorithm runs $2^{10}$ times to make the hash computationally 
     * expensive for hackers to crack via "brute force."
     */
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    const user = await User.create({
      name,
      room,
      pin: hashedPin,
      role: role || 'resident',
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          room: user.room,
          role: user.role,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { room, pin } = req.body;

  try {
    const user = await User.findOne({ room });

    /**
     * Security Note:
     * We often use the same "Invalid credentials" message for both a 
     * missing room and a wrong PIN. This prevents "account enumeration," 
     * where a hacker tries room numbers to see which ones are actually 
     * registered in your system.
     */
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare entered PIN with the hashed PIN in the DB
    const isMatch = await bcrypt.compare(pin, user.pin);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        room: user.room,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};
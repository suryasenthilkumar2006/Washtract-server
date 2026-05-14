import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

/**
 * What is Express Router?
 * The Router is a "mini-application" capable of performing middleware and 
 * routing functions. It allows us to group related routes (like all /auth 
 * endpoints) into a single file, keeping the main server.js clean and organized.
 */
const router = express.Router();

/**
 * Why separate Routes from Controllers?
 * This is called the "Separation of Concerns." 
 * - Routes: Define the "address" (URL) and the "method" (POST/GET).
 * - Controllers: Define the "brain" (the actual logic/database work).
 * This makes the code easier to test, debug, and scale as WashTrack grows.
 */

/**
 * What does the POST method mean here?
 * We use POST for registration and login because we are sending sensitive 
 * data (PINs, names) in the "body" of the request. Unlike GET requests, 
 * POST data is not visible in the URL, making it more secure and allowing 
 * for larger data payloads.
 */

// Route: /api/auth/register
// Note: The prefix '/api/auth' is added in server.js
router.post('/register', registerUser);

// Route: /api/auth/login
router.post('/login', loginUser);

export default router;
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * What is Middleware?
 * Middleware functions are functions that have access to the request (req) 
 * and response (res) objects. They sit in the middle of the request-response 
 * cycle. If the middleware doesn't find a valid token, it breaks the cycle 
 * and sends an error; otherwise, it passes the request forward.
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  /**
   * What is a Bearer Token?
   * It is a standard format for security tokens. "Bearer" literally means 
   * "give access to the bearer of this token." It indicates that the 
   * client is sending a JWT to prove their identity.
   */
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      /**
       * What jwt.verify() does:
       * It decrypts the token using your secret key. If the token has been 
       * tampered with or has expired, it will throw an error. If successful, 
       * it returns the 'payload' (the user ID we stored during login).
       */
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      /**
       * Why attach user to req.user?
       * By fetching the user from the DB and attaching it to the 'req' object, 
       * we make the user's data (ID, name, role) available to any route 
       * that comes AFTER this middleware.
       */
      req.user = await User.findById(decoded.id).select('-pin');

      /**
       * What next() does:
       * This is a callback that tells Express to move to the next function 
       * in the stack. Without calling next(), the request would just hang 
       * and the user would never get their data.
       */
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
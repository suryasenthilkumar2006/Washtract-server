import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMachines,
  startMachine,
  collectLaundry,
  reportIssue,
  markFixed,
  updateMachineStatus,
  togglePowerCut
} from '../controllers/machineController.js';

const router = express.Router();

/**
 * Public vs. Protected Routes:
 * - getMachines is public: This allows anyone to see the current status 
 *   of the laundry room without logging in (helpful for a quick glance).
 * - Others are protected: We use the 'protect' middleware to ensure 
 *   that only authenticated residents can start machines or report issues.
 */

// @route   GET /api/machines
// GET: Used to fetch data from the server without modifying it.
router.get('/', getMachines);

/**
 * What is /:id?
 * The colon denotes a 'Route Parameter'. In your controller, you access 
 * this via 'req.params.id'. It allows one route to handle requests for 
 * any specific machine in your database.
 */

// @route   POST /api/machines/:id/start
// POST: Used to "create" an action or send data that changes state.
router.post('/:id/start', protect, startMachine);

// @route   POST /api/machines/:id/collect
router.post('/:id/collect', protect, collectLaundry);

// @route   POST /api/machines/:id/report
router.post('/:id/report', protect, reportIssue);

// @route   POST /api/machines/:id/fixed
router.post('/:id/fixed', protect, markFixed);

// @route   PATCH /api/machines/:id/status
/**
 * PATCH vs. POST:
 * While POST is for general actions, PATCH is specifically used for 
 * "partial updates"—like changing only the status of a machine 
 * without modifying the rest of the document.
 */
router.patch('/:id/status', protect, updateMachineStatus);

// @route   POST /api/machines/power-cut
router.post('/power-cut', protect, togglePowerCut);

export default router;
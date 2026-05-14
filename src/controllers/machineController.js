import Machine from '../models/Machine.js';
import { io } from '../../server.js';

const REPORT_THRESHOLD = 3;

/**
 * Controller Parameter Guide:
 * - req.params: Used for URL segments (e.g., /api/machines/:id).
 * - req.body: Used for data sent in the request "payload" (JSON).
 * - req.user: Populated by our 'protect' middleware from the JWT.
 */

// @desc    Get all machines
// @route   GET /api/machines
export const getMachines = async (req, res) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching machines' });
  }
};

// @desc    Start a machine cycle
// @route   POST /api/machines/:id/start
export const startMachine = async (req, res) => {
  const { durationMinutes } = req.body;
  const { name, room, _id } = req.user;

  try {
    const machine = await Machine.findById(req.params.id);

    /**
     * Why check status before starting?
     * This prevents "Race Conditions"—where two residents might click 'Start' 
     * at the exact same time. The first request changes the status, and the 
     * second request is blocked.
     */
    if (!machine || machine.status !== 'free') {
      return res.status(400).json({ message: 'Machine is not available' });
    }

    machine.status = 'inuse';
    machine.currentUser = { userId: _id, name, room };
    machine.remainingTime = durationMinutes * 60;
    machine.totalTime = durationMinutes * 60;
    machine.lastUpdated = Date.now();

    const updatedMachine = await machine.save();

    /**
     * What io.emit does:
     * It broadcasts the updated machine data to EVERY connected client instantly.
     * This is why the UI updates without the user needing to refresh the page.
     */
    io.emit('machineUpdated', updatedMachine);
    res.json(updatedMachine);
  } catch (error) {
    res.status(500).json({ message: 'Error starting machine' });
  }
};

// @desc    Update status (manual)
// @route   PATCH /api/machines/:id/status
export const updateMachineStatus = async (req, res) => {
  const { status } = req.body;
  try {
    // findByIdAndUpdate vs Find-then-Save:
    // We use Find-then-Save here to trigger Mongoose validation and logic.
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    machine.status = status;
    const updatedMachine = await machine.save();

    io.emit('machineUpdated', updatedMachine);
    res.json(updatedMachine);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status' });
  }
};

// @desc    Reset machine after laundry is taken
// @route   POST /api/machines/:id/collect
export const collectLaundry = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    machine.status = 'free';
    machine.currentUser = { userId: null, name: '', room: '' };
    machine.remainingTime = 0;
    machine.totalTime = 0;

    const updatedMachine = await machine.save();
    io.emit('machineUpdated', updatedMachine);
    res.json(updatedMachine);
  } catch (error) {
    res.status(500).json({ message: 'Error collecting laundry' });
  }
};

// @desc    Report a machine issue
// @route   POST /api/machines/:id/report
export const reportIssue = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    machine.reports += 1;

    if (machine.reports >= REPORT_THRESHOLD) {
      machine.status = 'fault';
    }

    const updatedMachine = await machine.save();
    io.emit('machineUpdated', updatedMachine);
    res.json(updatedMachine);
  } catch (error) {
    res.status(500).json({ message: 'Error reporting issue' });
  }
};

// @desc    Admin fix machine
// @route   POST /api/machines/:id/fix
export const markFixed = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    machine.status = 'free';
    machine.reports = 0;
    machine.currentUser = { userId: null, name: '', room: '' };

    const updatedMachine = await machine.save();
    io.emit('machineUpdated', updatedMachine);
    res.json(updatedMachine);
  } catch (error) {
    res.status(500).json({ message: 'Error fixing machine' });
  }
};

// @desc    Global Power Cut Toggle
// @route   POST /api/machines/power-cut
export const togglePowerCut = async (req, res) => {
  const { powerCutActive } = req.body;

  try {
    if (powerCutActive) {
      // Pause all in-use machines
      await Machine.updateMany({ status: 'inuse' }, { status: 'paused' });
    } else {
      // Resume all paused machines
      await Machine.updateMany({ status: 'paused' }, { status: 'inuse' });
    }

    io.emit('powerCutToggled', { powerCutActive });
    res.json({ success: true, powerCutActive });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling power cut' });
  }
};
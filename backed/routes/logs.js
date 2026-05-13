import express from 'express';
import { 
  markComplete, 
  unmarkComplete, 
  getToday, 
  getRange, 
  getHeatmap, 
  getAllStats, 
  getHabitStats 
} from '../controllers/logController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All log routes require the user to be authenticated
router.use(protect);


// POST /api/logs - Mark a habit as complete for a specific day
router.post('/', markComplete);

// DELETE /api/logs - Unmark a habit (removes the log)
// Note: Sending a body with a DELETE request is slightly unusual, 
// but supported. It keeps the API symmetric with the POST route.
router.delete('/', unmarkComplete);


// GET /api/logs/today - Get all completions for the current user for today
router.get('/today', getToday);

// GET /api/logs/range?start=YYYY-MM-DD&end=YYYY-MM-DD - Get completions within a date range
router.get('/range', getRange);

// GET /api/logs/heatmap - Get 90-day aggregated heatmap data
router.get('/heatmap', getHeatmap);

// The '/stats' route MUST come before the '/stats/:id' route.
// If '/stats/:id' was first, Express would interpret a request to '/stats' 
// as trying to visit a route with an empty ID parameter.
router.get('/stats', getAllStats);
router.get('/stats/:id', getHabitStats);

export default router;
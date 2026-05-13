import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  weeklyReport, 
  suggestHabits, 
  streakRecovery, 
  chatAnalysis, 
  morningMotivation 
} from '../controllers/aiController.js';

const router = express.Router();

// All AI routes require the user to be logged in
router.use(protect);

// POST /api/ai/weekly-report
router.post('/weekly-report', weeklyReport);

// POST /api/ai/suggest-habits
router.post('/suggest-habits', suggestHabits);

// POST /api/ai/streak-recovery
router.post('/streak-recovery', streakRecovery);

// POST /api/ai/chat
router.post('/chat', chatAnalysis);

// GET /api/ai/morning-motivation
router.get('/morning-motivation', morningMotivation);

export default router;
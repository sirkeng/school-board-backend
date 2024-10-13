import { Router } from 'express';
import { ScoreboardController } from '../controllers/scoreboardController';
import { isLoggedin } from '../middlewares/auth';

const router = Router();

router.post('/', isLoggedin, ScoreboardController.createScoreboard); // Create scoreboard
router.get('/', ScoreboardController.getAllScoreboards); // Get all scoreboards
router.put('/:id', isLoggedin, ScoreboardController.updateScoreboard); // Update scoreboard by ID
router.delete('/:id', isLoggedin, ScoreboardController.deleteScoreboard); // Delete scoreboard by ID

export default router;

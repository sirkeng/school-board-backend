import { Router } from 'express';
import { SeasonController } from '../controllers/seasonController';
import { SportController } from '../controllers/sportController';
import { uploadLocal } from '../middlewares/uploadLocal';
import { isLoggedin } from '../middlewares/auth';

const router = Router();

router.post('/', isLoggedin, SeasonController.createSeason); // Create season
router.get('/', SeasonController.getAllSeasons); // Get all seasons
router.put('/:id', isLoggedin, SeasonController.updateSeason); // Update season by ID
router.delete('/:id', isLoggedin, SeasonController.deleteSeason); // Delete season by ID

router.post('/sport', isLoggedin, uploadLocal.single('image'), SportController.createSport); // Create sport (local storage)
router.put('/sport/:id', isLoggedin, uploadLocal.single('image'), SportController.updateSport); // Update sport by ID (local storage)
router.delete('/sport/:id', isLoggedin, SportController.deleteSport); // Delete sport by ID

export default router;

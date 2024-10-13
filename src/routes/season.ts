import { Router } from 'express';
import { SeasonController } from '../controllers/seasonController';
import { SportController } from '../controllers/sportController';
import { upload } from '../middlewares/upload';
import { isLoggedin } from '../middlewares/auth';

const router = Router();

router.post('/', isLoggedin, SeasonController.createSeason); // Create season
router.get('/', SeasonController.getAllSeasons); // Get all seasons
router.put('/:id', isLoggedin, SeasonController.updateSeason); // Update season by ID
router.delete('/:id', isLoggedin, SeasonController.deleteSeason); // Delete season by ID

router.post('/sport', isLoggedin, upload.single('image'), SportController.createSport); // Create sport
router.put('/sport/:id', isLoggedin, upload.single('image'), SportController.updateSport); // Update sport by ID
router.delete('/sport/:id', isLoggedin, SportController.deleteSport); // Delete sport by ID

export default router;

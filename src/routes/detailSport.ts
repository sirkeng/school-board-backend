import { Router } from 'express';
import { DetailSportController } from '../controllers/detailSportController';
import { AwardController } from '../controllers/awardController';
import { RecentGameController } from '../controllers/recentGameController';
import { uploadLocal } from '../middlewares/uploadLocal';
import { isLoggedin } from '../middlewares/auth';

const router = Router();

router.get('/last-seasons', DetailSportController.getLastSeasons); // Fetch last seasons by limit

router.get('/:id', DetailSportController.getDetailSport); // Get detail sport by sport ID

router.post(
    '/',
    isLoggedin,
    uploadLocal.fields([
        { name: 'bannerImage', maxCount: 1 },
        { name: 'coachProfileImage', maxCount: 1 },
        { name: 'seasonImage', maxCount: 1 },
    ]),
    DetailSportController.createDetailSport,
); // Create detail sport
router.put(
    '/:id',
    isLoggedin,
    uploadLocal.fields([
        { name: 'bannerImage', maxCount: 1 },
        { name: 'coachProfileImage', maxCount: 1 },
        { name: 'seasonImage', maxCount: 1 },
    ]),
    DetailSportController.updateDetailSport,
); // Update detail sport by ID
router.delete('/:id', isLoggedin, DetailSportController.deleteDetailSport); // Delete detail sport by ID

router.post('/award', isLoggedin, AwardController.createAward); // Create award
router.put('/award/:id', isLoggedin, AwardController.updateAward); // Update award by ID
router.delete('/award/:id', isLoggedin, AwardController.deleteAward); // Delete award by ID

router.post('/recent-game', isLoggedin, RecentGameController.createRecentGame); // Create recent game
router.put('/recent-game/:id', isLoggedin, RecentGameController.updateRecentGame); // Update recent game by ID
router.delete('/recent-game/:id', isLoggedin, RecentGameController.deleteRecentGame); // Delete recent game by ID
export default router;

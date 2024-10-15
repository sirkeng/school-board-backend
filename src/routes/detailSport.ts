import { Router } from 'express';
import { DetailSportController } from '../controllers/detailSportController';
import { AwardController } from '../controllers/awardController';
import { uploadLocal } from '../middlewares/uploadLocal';
import { isLoggedin } from '../middlewares/auth';

const router = Router();

router.post('/', isLoggedin, uploadLocal.single('image'), DetailSportController.createDetailSport); // Create detail sport
router.get('/:id', DetailSportController.getDetailSport); // Get detail sport by ID
router.put('/:id', isLoggedin, uploadLocal.single('image'), DetailSportController.updateDetailSport); // Update detail sport by ID
router.delete('/:id', isLoggedin, DetailSportController.deleteDetailSport); // Delete detail sport by ID

router.post('/award', isLoggedin, AwardController.createAward); // Create award
router.put('/award/:id', isLoggedin, AwardController.updateAward); // Update award by ID
router.delete('/award/:id', isLoggedin, AwardController.deleteAward); // Delete award by ID

export default router;

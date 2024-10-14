import { Router } from 'express';
import { BannerController } from '../controllers/bannerController';
import { uploadLocal } from '../middlewares/uploadLocal';
import { isLoggedin } from '../middlewares/auth';

const router = Router();

router.post('/', isLoggedin, uploadLocal.single('video'), BannerController.createBanner); // Create banner (local storage)
router.get('/', BannerController.getBanner); // Get banner (single banner)
router.put('/:id', isLoggedin, uploadLocal.single('video'), BannerController.updateBanner); // Update banner by ID (local storage)
router.delete('/:id', isLoggedin, BannerController.deleteBanner); // Delete banner by ID

export default router;

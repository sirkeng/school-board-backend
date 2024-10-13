import { Router } from 'express';
import { NewsController } from '../controllers/newsController';
import { isLoggedin } from '../middlewares/auth';

const router = Router();

router.post('/', isLoggedin, NewsController.createNews); // Create a news article
router.get('/', NewsController.getAllNews); // Get all news
router.put('/:id', isLoggedin, NewsController.updateNews); // Update news by ID
router.delete('/:id', isLoggedin, NewsController.deleteNews); // Delete news by ID

export default router;

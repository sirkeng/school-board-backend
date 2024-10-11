import { Router } from 'express';
import { FileController } from '../controllers/fileController';
import { upload } from '../middlewares/upload';
import { isLoggedin } from '../middlewares/auth';
const router = Router();

// Save files to AWS S3 and store file-related information in the database. Up to 10 files can be uploaded at once.
router.post('/', isLoggedin, upload.array('files', 10), FileController.uploadFiles);

export default router;


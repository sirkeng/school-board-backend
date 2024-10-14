import multer from 'multer';
import moment from 'moment-timezone';
import { IMAGES_FOLDER, VIDEOS_FOLDER } from '../config/filePaths';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = IMAGES_FOLDER;
        if (file.mimetype.includes('video')) {
            folder = VIDEOS_FOLDER;
        }
        cb(null, folder);
    },
    filename: function (req, file, cb) {
        const date = moment().format('YYYY-MM-DD-HH-mm-ss');
        const fileExtension = file.originalname.split('.').pop();
        const filename = `file-${date}.${fileExtension}`;
        cb(null, filename);
    },
});

const uploadLocal = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and MP4 files are allowed.'));
        }
    },
});

export { uploadLocal };

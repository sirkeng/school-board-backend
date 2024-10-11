import 'dotenv/config';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import moment from 'moment-timezone';
import { config } from '../controllers/config/config';

// Environment configuration and AWS S3 client initialization
const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    },
});

// Multer and Multer-S3 configuration
const upload = multer({
    storage: multerS3({
        s3: s3, // The client object created above
        bucket: process.env.AWS_BUCKET_NAME, // Bucket name
        acl: 'public-read', // Add public read access setting
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const date = moment().tz(config.timezone).format('YYYY-MM-DD-HH:mm:ss'); // Time when stored in S3
            const fileExtension = file.originalname.split('.').pop(); // File extension for storage in S3
            const filename = `file-${date}.${fileExtension}`; // File name for storage in S3
            cb(null, filename);
        },
    }),
});

export { upload };

import { Request, Response } from 'express';
import { File } from '../entities/File';
import AppDataSource from '../database/data-source';
import { UserFile } from '../entities/UserFile';
import { PostFile } from '../entities/PostFile';
import { CommentFile } from '../entities/CommentFile';
import { CoachFile } from '../entities/CoachFiles';

export class FileController {
    static uploadFiles = async (req: Request, res: Response) => {
        try {
            const files = req.files as Express.MulterS3.File[];
            const fileRepository = AppDataSource.getRepository(File);
            const userFileRepository = AppDataSource.getRepository(UserFile);
            const postFileRepository = AppDataSource.getRepository(PostFile);
            const commentFileRepository = AppDataSource.getRepository(CommentFile);
            const coachFileRepository = AppDataSource.getRepository(CoachFile);

            let { userId, postId, commentId, coachId } = req.body;
            userId = userId ? parseInt(userId) : null;
            postId = postId ? parseInt(postId) : null;
            commentId = commentId ? parseInt(commentId) : null;
            coachId = coachId ? parseInt(coachId) : null;

            if (!files || files.length === 0) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            if (!userId && !postId && !commentId && !coachId) {
                // When none of userId, postId, commentId, coachId are provided
                return res.status(400).json({ message: 'At least one of userId, postId, commentId, or coachId is required.' });
            }

            /**
             * req.files may contain multiple files.
             * Transform the file data using map to format it before saving to the database.
             * Using Promise.all to save files simultaneously instead of sequentially.
             */

            const newFiles = files.map(async file => {
                const newFile = fileRepository.create({
                    name: file.originalname,
                    mime: file.mimetype,
                    size: file.size,
                    url: file.location,
                });

                const savedFile = await fileRepository.save(newFile);

                // Save IDs in the intermediate tables for User-File, Post-File, Comment-File relationships
                if (userId) {
                    const userFile = userFileRepository.create({
                        userId,
                        fileId: savedFile.id,
                    });
                    await userFileRepository.save(userFile);
                }

                if (postId) {
                    const postFile = postFileRepository.create({
                        postId,
                        fileId: savedFile.id,
                    });
                    await postFileRepository.save(postFile);
                }

                if (commentId) {
                    const commentFile = commentFileRepository.create({
                        commentId,
                        fileId: savedFile.id,
                    });
                    await commentFileRepository.save(commentFile);
                }

                if (coachId) {
                    const coachFile = coachFileRepository.create({
                        coachId,
                        fileId: savedFile.id,
                    });
                    await coachFileRepository.save(coachFile);
                }

                return newFile;
            });

            const savedFiles = await Promise.all(newFiles); // Save multiple files simultaneously with Promise.all

            return res.status(201).json(savedFiles);
        } catch (error) {
            return res.status(404).json({ message: 'Unable to upload files.', error });
        }
    };
}


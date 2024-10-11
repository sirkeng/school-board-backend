import { Request, Response } from 'express';
import AppDataSource from '../database/data-source';
import { Like } from '../entities/Like';

class LikeController {
    static addLike = async (req: Request, res: Response) => {
        const { postId, commentId } = req.body;
        const userId = req.user.userId;
        const likeRepository = AppDataSource.getRepository(Like);

        try {
            if (postId === undefined && commentId === undefined) {
                return res.status(400).json({ message: 'Either postId or commentId is required.' });
            }

            if (postId !== undefined && commentId !== undefined) {
                return res.status(400).json({ message: 'postId and commentId cannot be provided simultaneously.' });
            }

            // Check for duplicate likes
            let existingLike: Like;
            if (postId !== undefined) {
                existingLike = await likeRepository.findOne({
                    where: { postId, userId },
                });
            } else if (commentId !== undefined) {
                existingLike = await likeRepository.findOne({
                    where: { commentId, userId },
                });
            }

            if (existingLike) {
                return res.status(400).json({ message: 'You have already liked this.' });
            }

            const newLike = likeRepository.create({
                postId: postId || null,
                commentId: commentId || null,
                userId,
            });

            await likeRepository.save(newLike);
            res.status(201).json(newLike);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Failed to add like.' });
        }
    };

    static removeLike = async (req: Request, res: Response) => {
        const likeId = Number(req.params.id);
        const likeRepository = AppDataSource.getRepository(Like);

        try {
            const like = await likeRepository.findOne({ where: { id: likeId } });
            if (!like) {
                return res.status(404).json({ message: 'Like not found.' });
            }

            await likeRepository.remove(like);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete like', error });
        }
    };
}

export default LikeController;

import { Request, Response } from 'express';
import { Post } from '../entities/Post';
import AppDataSource from '../database/data-source';

export class CarouselController {
    // Set a featured post to display on the carousel
    static featurePost = async (req: Request, res: Response) => {
        const { boardId, categoryId, postId } = req.body;
        const postRepository = AppDataSource.getRepository(Post);

        try {
            // Create the condition object to query Post data
            const conditions = {
                id: Number(postId),
                boardId: Number(boardId),
                categoryId,
            };

            // Check if categoryId exists. If so, convert it from String to Number
            if (categoryId !== undefined && categoryId !== null) {
                conditions.categoryId = Number(categoryId);
            }

            const post = await postRepository.findOne({ where: conditions });

            if (post) {
                post.isCarousel = true;
                await postRepository.save(post);
                res.json({ message: 'The post has been featured on the carousel', post });
            } else {
                res.status(404).json({ message: 'Post not found.' });
            }
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to feature the post on the carousel.' });
        }
    };

    // Remove a featured post from the carousel
    static unfeaturePost = async (req: Request, res: Response) => {
        const { boardId, categoryId, postId } = req.body;
        const postRepository = AppDataSource.getRepository(Post);

        try {
            const conditions = {
                id: parseInt(postId),
                boardId: parseInt(boardId),
                categoryId,
            };

            if (categoryId !== undefined && categoryId !== null) {
                conditions.categoryId = parseInt(categoryId);
            }

            const post = await postRepository.findOne({ where: conditions });

            if (post) {
                post.isCarousel = false;
                await postRepository.save(post);
                res.json({ message: 'The post has been removed from the carousel', post });
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to remove the post from the carousel' });
        }
    };

    // Route to get featured posts displayed on the carousel
    static getFeaturedPosts = async (req: Request, res: Response) => {
        const postRepository = AppDataSource.getRepository(Post);

        try {
            const featuredPosts = await postRepository.find({
                where: { isCarousel: true },
                order: { createdAt: 'DESC' },
            });
            res.status(200).json(featuredPosts);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve carousel posts' });
        }
    };
}


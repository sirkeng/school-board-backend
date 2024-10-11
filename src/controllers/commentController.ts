import { Request, Response } from 'express';
import { Comment } from '../entities/Comment';
import AppDataSource from '../database/data-source';
import { IsNull, MoreThanOrEqual } from 'typeorm';

export class CommentController {
    // Create a comment
    static createComment = async (req: Request, res: Response) => {
        const { content, parentCommentId } = req.body;
        const userId = req.user.userId;
        const postId = Number(req.params.postId);

        // Validation check
        if (isNaN(userId) || isNaN(postId) || !content) {
            return res.status(400).json({ message: 'Invalid input value' });
        }

        const commentRepository = AppDataSource.getRepository(Comment);

        try {
            // If there is a parent comment, find the parent comment
            let parentComment = null;
            if (parentCommentId) {
                parentComment = await commentRepository.findOne({ where: { id: parentCommentId } });
                if (!parentComment) {
                    return res.status(400).json({ message: 'Invalid parent comment ID' });
                }
            }

            // Create a new comment
            const newComment = commentRepository.create({
                userId,
                postId,
                content,
                parentComment,
            });

            // Save the comment
            await commentRepository.save(newComment);

            // Return the new comment information and related information
            const savedComment = await commentRepository.findOne({
                where: { id: newComment.id },
                relations: ['parentComment'],
            });

            res.status(201).json(savedComment);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to create comment' });
        }
    };

    // Retrieve comments and replies for a specific post
    static getCommentsByPostId = async (req: Request, res: Response) => {
        const postId = Number(req.params.postId);

        if (isNaN(postId)) {
            return res.status(400).json({ message: 'Invalid input value' });
        }
        const commentRepository = AppDataSource.getRepository(Comment);

        try {
            // Retrieve only the main comments and include their replies
            const comments = await commentRepository.find({
                where: { postId, parentComment: IsNull() },
                relations: ['replies'],
                order: { createdAt: 'ASC' },
            });

            // Sort replies in the order they were created
            comments.forEach(comment => {
                comment.replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            });

            res.json(comments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to retrieve comments' });
        }
    };

    // Retrieve best comments for a specific post (best comments have 5 or more likes)
    static getBestCommentByPostId = async (req: Request, res: Response) => {
        const postId = Number(req.params.postId);
        const commentRepository = AppDataSource.getRepository(Comment);

        try {
            const bestComment = await commentRepository.find({
                where: { postId, likesCount: MoreThanOrEqual(5) },
                order: { likesCount: 'DESC' },
                take: 1,
            });
            return res.status(200).json(bestComment);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve best comment', error });
        }
    };

    // Update a comment
    static updateComment = async (req: Request, res: Response) => {
        const commentId = Number(req.params.id);
        const { content } = req.body;
        const commentRepository = AppDataSource.getRepository(Comment);

        try {
            const comment = await commentRepository.findOne({
                where: { id: commentId },
            });

            if (comment) {
                comment.content = content;
                await commentRepository.save(comment);
                res.json(comment);
            } else {
                res.status(404).json({ message: 'Comment not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to update comment' });
        }
    };

    // Delete a comment
    static deleteComment = async (req: Request, res: Response) => {
        const commentId = Number(req.params.id);
        const commentRepository = AppDataSource.getRepository(Comment);

        try {
            const comment = await commentRepository.findOne({
                where: { id: commentId },
            });
            if (comment) {
                await commentRepository.remove(comment);
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Comment not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete comment' });
        }
    };
}



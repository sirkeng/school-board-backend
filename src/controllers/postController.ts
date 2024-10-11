import { Request, Response } from 'express';
import { Post } from '../entities/Post';
import AppDataSource from '../database/data-source';
import { Category } from '../entities/Category';
import { Board } from '../entities/Board';
import { User } from '../entities/User';
import { Between, FindOptionsWhere, In, LessThan, MoreThan } from 'typeorm';

export class PostController {
    // Create a post
    static createPost = async (req: Request, res: Response) => {
        const userId = req.user.userId;
        const { boardId, categoryId, title, content, season, isAnonymous } = req.body;
        const postRepository = AppDataSource.getRepository(Post);

        // Create a newPost object
        const newPost = postRepository.create({
            userId,
            boardId,
            categoryId,
            title,
            content,
            season,
            isAnonymous,
        });

        try {
            // Save newPost to the post table
            const savedPost = await postRepository.save(newPost);

            res.status(201).json(savedPost);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Post creation failed' });
        }
    };

    // Get sports categories
    static getSportsCategories = async (req: Request, res: Response) => {
        const { year, season } = req.query;
        const postRepository = AppDataSource.getRepository(Post);
        const categoryRepository = AppDataSource.getRepository(Category);

        const startDate = new Date(`${year}-08-01`);
        const endDate = new Date(`${year}-07-31`);

        try {
            // Classify sports posts by year and season
            const posts = await postRepository.find({
                where: { season: season as string, createdAt: Between(startDate, endDate) },
            });

            // Retrieve categories using categoryId to get category names
            const categoryIds = posts.map(post => post.categoryId);
            const categories = await categoryRepository.find({
                where: { id: In(categoryIds) },
            });

            // Add category names to each post
            const postsWithCategories = posts.map(post => {
                const category = categories.find(cat => cat.id === post.categoryId);
                return {
                    ...post,
                    categoryName: category ? category.name : null,
                };
            });

            res.status(200).json(postsWithCategories);
        } catch (error) {
            res.status(400).json({ message: 'Failed to create posts.' });
        }
    };

    // Retrieve all posts
    static getAllPosts = async (req: Request, res: Response) => {
        const { sort, limit, cursor } = req.query; // Get sort and limit from query
        const { boardName, categoryName } = req.body; // Get boardName and categoryName from body
        const userId = req.user.userId;

        const boardRepository = AppDataSource.getRepository(Board);
        const categoryRepository = AppDataSource.getRepository(Category);
        const postRepository = AppDataSource.getRepository(Post);
        const userRepository = AppDataSource.getRepository(User);

        try {
            let order = {}; // Initialize order object

            switch (sort) {
                // Latest first
                case 'latest':
                    order = { createdAt: 'DESC' };
                    break;

                // Oldest first
                case 'oldest':
                    order = { createdAt: 'ASC' };
                    break;

                // Most liked
                case 'mostLikes':
                    order = { likesCount: 'DESC' };
                    break;

                default:
                    order = { createdAt: 'DESC' };
            }

            const board = await boardRepository.findOne({
                where: { name: boardName },
            });

            // Check if the board exists
            if (!board) {
                return res.status(404).json({ message: 'Board not found.' });
            }

            let category = null; // Default is null for boards without categories
            if (categoryName) {
                category = await categoryRepository.findOne({
                    where: { name: categoryName },
                });

                // Check if the category exists
                if (!category) {
                    return res.status(404).json({ message: 'Category not found.' });
                }
            }

            const whereClause: FindOptionsWhere<Post> = { boardId: board.id };

            if (category) {
                // If a category exists, add categoryId to where clause
                whereClause.categoryId = category.id;
            }

            if (cursor) {
                // If sorting by oldest, get createdAt greater than cursor
                const cursorDate = new Date(cursor as string);
                if (sort === 'oldest') {
                    whereClause.createdAt = MoreThan(cursorDate);
                } else {
                    whereClause.createdAt = LessThan(cursorDate);
                }
            }

            // Find posts including the user ID and name of the post author
            const posts = await postRepository.find({
                where: whereClause,
                order,
                take: Number(limit), // Maximum number of rows to return
            });

            // Get logged-in user
            const user = await userRepository.findOne({ where: { id: userId } });

            // Handle anonymity setting
            const result = await Promise.all(
                posts.map(async post => {
                    // Author information
                    const author = await userRepository.findOne({ where: { id: post.userId } });
                    if (post.isAnonymous && user?.role !== 'teacher') {
                        // If the user's role is not teacher, display the post anonymously
                        return {
                            ...post,
                            userId: null,
                            user: { id: null, name: 'Anonymous' },
                        };
                    } else {
                        // If the user's role is teacher, display the post with the author's name
                        return {
                            ...post,
                            user: { id: author?.id, name: author?.name },
                        };
                    }
                }),
            );

            const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt : null;

            res.status(200).json({ nextCursor, posts: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to retrieve posts' });
        }
    };

    // Retrieve detailed post by ID
    static getPostById = async (req: Request, res: Response) => {
        const postId = Number(req.params.id);
        const userRepository = AppDataSource.getRepository(User);
        const postRepository = AppDataSource.getRepository(Post);
        const userRole = (req as any).role; // Role of the requester

        try {
            const post = await postRepository.findOne({ where: { id: postId } });

            // Check if the post exists
            if (!post) {
                res.status(404).json({ message: 'Post not found' });
            }

            // Handle anonymity setting for post author information
            const author: Partial<User> = await userRepository.findOne({
                where: { id: post.userId },
                select: ['id', 'name'],
            });
            const responsePost = { ...post, user: author };

            // If the requester is a teacher, they can see the author's name
            if (post.isAnonymous) {
                responsePost.userId = userRole.role === 'teacher' ? post.userId : null;
                responsePost.user =
                    userRole.role === 'teacher' ? { id: author.id, name: author.name } : { id: null, name: null };
            }
            res.status(200).json(responsePost);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve post' });
        }
    };

    // Update a post
    static updatePost = async (req: Request, res: Response) => {
        const postId = Number(req.params.id);
        const { title, content, season } = req.body;
        const postRepository = AppDataSource.getRepository(Post);

        try {
            const post = await postRepository.findOne({ where: { id: postId } });
            if (post) {
                post.title = title;
                post.content = content;
                post.season = season;
                await postRepository.save(post);
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Post update failed' });
        }
    };

    // Delete a post
    static deletePost = async (req: Request, res: Response) => {
        const postId = Number(req.params.id);
        const postRepository = AppDataSource.getRepository(Post);

        try {
            const post = await postRepository.findOne({ where: { id: postId } });
            if (post) {
                await postRepository.remove(post);
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Post not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Post deletion failed' });
        }
    };
}

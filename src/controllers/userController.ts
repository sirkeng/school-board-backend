import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { RoleType } from '../entities/enums/RoleType';
import { generateAccessToken, verifyRefreshToken } from '../utils/jwt';
import AppDataSource from '../database/data-source';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Comment } from '../entities/Comment';

export class UserController {
    // Retrieve user information by user ID
    static getUserById = async (req: Request, res: Response) => {
        const userId = Number(req.params.id);
        const userRepository = AppDataSource.getRepository(User);

        try {
            const userData = await userRepository.findOne({
                where: { id: userId },
                select: ['id', 'name', 'email', 'role'], // Select only id, name, email, and role
            });
            if (!userData) {
                return res.status(404).json({ message: 'User does not exist.' });
            }

            res.status(200).json(userData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Could not retrieve user information due to server error.' });
        }
    };

    // Change user role by a teacher
    static updateRole = async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please log in.' });
        }

        const { memberId, role } = req.body;

        const userRepository = AppDataSource.getRepository(User);
        try {
            const userData = await userRepository.findOne({ where: { id: user.userId } });

            // Check if the user is a teacher
            if (userData.role !== RoleType.TEACHER) {
                return res.status(400).json({ message: 'You do not have permission to change roles.' });
            }

            // Validate role type
            if (!Object.values(RoleType).includes(role)) {
                return res.status(400).json({ message: 'Role type is invalid.' });
            }

            // Check if the user exists
            const member = await userRepository.findOne({ where: { id: memberId } });
            if (!member) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Check if changing to the same role
            if (member.role === role) {
                return res.status(400).json({ message: `${member.name} already has the same role.` });
            }

            member.role = role;
            await userRepository.save(member);

            res.status(200).json({ message: `${member.name}'s role has been changed to ${role}.` });
        } catch (error) {
            res.status(500).json({ message: 'A server error occurred.' });
        }
    };

    // Update user information
    static updateUser = async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please log in.' });
        }

        const { name, password, newPassword, checkNewPassword } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const userData = await userRepository.findOne({ where: { id: user.userId } });

            // Validate name format
            const nameRegex = /^[가-힣a-zA-Z]{2,20}$/;
            if (name && !nameRegex.test(name)) {
                return res.status(400).json({ message: 'Name must be between 2-20 characters and can only contain Korean or English letters.' });
            }

            // Check if the existing password matches
            if (password) {
                const isMatch = await bcrypt.compare(password, userData.password);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Existing password does not match.' });
                }
            }

            // Check if new passwords match
            if (newPassword && checkNewPassword) {
                if (newPassword !== checkNewPassword) {
                    return res.status(400).json({ message: 'New passwords do not match.' });
                }
            }

            // Check if new password is the same as the current password
            const isSameAsCurrentPassword = await bcrypt.compare(newPassword, userData.password);
            if (isSameAsCurrentPassword) {
                return res.status(400).json({ message: 'New password is the same as the existing password.' });
            }

            // Update user information
            if (name) {
                userData.name = name;
            }
            if (newPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                userData.password = hashedPassword;
            }

            await userRepository.save(userData);

            res.json({ message: 'User information has been updated.' });
        } catch (error) {
            res.status(500).json({ message: 'A server error occurred.' });
        }
    };

    // Withdraw membership
    static deleteUser = async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please log in.' });
        }

        const { password } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const userData = await userRepository.findOne({ where: { id: user.userId } });

            if (!userData) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Confirm password
            const isMatch = await bcrypt.compare(password, userData.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Password does not match.' });
            }

            await userRepository.remove(userData);

            res.json({ message: 'Membership withdrawal has been completed.' });
        } catch (error) {
            res.status(500).json({ message: 'A server error occurred.' });
        }
    };

    // Logout
    static logout = async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please log in.' });
        }

        try {
            const userRepository = AppDataSource.getRepository(User);
            const userData = await userRepository.findOne({ where: { id: user.userId } });

            if (!userData) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Logout
            if (!userData.refreshToken) {
                return res.status(400).json({ message: 'You are already logged out.' });
            }
            userData.refreshToken = null;
            await userRepository.save(userData);

            res.status(200).json({ message: 'You have been logged out.' });
        } catch (error) {
            res.status(500).json({ message: 'A server error occurred.' });
        }
    };

    // Verify RefreshToken and reissue AccessToken
    static reissueAccessToken = async (req: Request, res: Response) => {
        const refreshToken = req.header('Authorization')?.replace('Bearer ', '');

        if (!refreshToken) {
            return res.status(400).json({ message: 'RefreshToken is required.' });
        }

        try {
            const decodedToken = verifyRefreshToken(refreshToken);
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: decodedToken.userId } });

            // Check RefreshToken validity
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ message: 'Invalid RefreshToken.' });
            }

            // Reissue AccessToken
            const newAccessToken = generateAccessToken(user.id, user.role);

            res.json({ accessToken: newAccessToken });
        } catch (error) {
            res.status(403).json({ message: 'Invalid RefreshToken.' });
        }
    };

    // Retrieve posts written by the user
    static getMyPosts = async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please log in.' });
        }

        try {
            const postRepository = AppDataSource.getRepository(Post);

            const myPosts = await postRepository.find({
                where: { userId: user.userId },
                select: ['id', 'title', 'createdAt'],
                order: { createdAt: 'DESC' },
            });

            res.status(200).json(myPosts);
        } catch (error) {
            res.status(500).json({ message: 'A server error occurred.' });
        }
    };

    // Retrieve comments written by the user
    static getMyComments = async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Please log in.' });
        }

        try {
            const postRepository = AppDataSource.getRepository(Post);
            const commentRepository = AppDataSource.getRepository(Comment);

            const myComments = await commentRepository.find({
                where: { userId: user.userId },
                select: ['content', 'createdAt', 'postId'],
                order: { createdAt: 'DESC' },
            });

            const myCommentsWithPost = await Promise.all(
                myComments.map(async comment => {
                    const post = await postRepository.findOne({
                        where: { id: comment.postId },
                        select: ['title'],
                    });
                    return {
                        ...comment,
                        postTitle: post ? post.title : 'This post has been deleted.',
                    };
                }),
            );

            res.status(200).json(myCommentsWithPost);
        } catch (error) {
            res.status(500).json({ message: 'A server error occurred.' });
        }
    };
}

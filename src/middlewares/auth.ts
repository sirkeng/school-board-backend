import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { RoleType } from '../entities/enums/RoleType';

// AccessToken validation middleware
export const isLoggedin = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.header('Authorization')?.replace('Bearer ', '');

    if (!accessToken) {
        return res.status(401).json({ message: 'AccessToken is required.' });
    }

    try {
        const decodedToken = verifyAccessToken(accessToken);
        req.user = {
            userId: decodedToken.userId,
            role: decodedToken.role as RoleType,
        };

        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid AccessToken.' });
    }
};

// Role validation middleware
export const checkRole = (...requiredRoles: RoleType[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Login is required.' });
        }

        if (!requiredRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Permission denied.' });
        }

        next();
    };
};


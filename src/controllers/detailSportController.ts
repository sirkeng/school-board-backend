import { Request, Response } from 'express';
import { DetailSport } from '../entities/DetailSport';
import { Sport } from '../entities/Sport';
import AppDataSource from '../database/data-source';
import path from 'path';
import fs from 'fs';
import { UPLOADS_FOLDER } from '../config/filePaths';

export class DetailSportController {
    static async getDetailSport(req: Request, res: Response) {
        const { id } = req.params;
        const detailSportRepository = AppDataSource.getRepository(DetailSport);

        try {
            const detailSport = await detailSportRepository.findOne({
                where: { sport: { id: Number(id) } },
                relations: ['sport', 'awards', 'recentGames'],
            });
            if (!detailSport) {
                return res.status(404).json({ message: 'Detail sport not found' });
            }
            res.status(200).json(detailSport);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to get detail sport' });
        }
    }

    static async createDetailSport(req: Request, res: Response) {
        const {
            bannerTitle,
            coachName,
            coachDescription,
            recentGameTitle,
            recentGameDescription,
            seasonNumber,
            seasonDetail,
            sportId,
        } = req.body;
        const detailSportRepository = AppDataSource.getRepository(DetailSport);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        try {
            const bannerImageUrl = files.bannerImage ? `/uploads/images/${files.bannerImage[0].filename}` : '';
            const coachProfileImageUrl = files.coachProfileImage
                ? `/uploads/images/${files.coachProfileImage[0].filename}`
                : '';
            const seasonImageUrl = files.seasonImage ? `/uploads/images/${files.seasonImage[0].filename}` : '';

            const sport = await AppDataSource.getRepository(Sport).findOneBy({ id: sportId });
            if (!sport) {
                return res.status(409).json({ message: 'Sport not found' });
            }

            // Check if a detail sport with the same sportId already exists
            const existingDetailSport = await detailSportRepository.findOneBy({ sport: { id: sportId } });
            if (existingDetailSport) {
                return res.status(409).json({ message: 'Detail sport for this sport already exists' });
            }

            const newDetailSport = detailSportRepository.create({
                bannerTitle,
                bannerImageUrl,
                coachName,
                coachDescription,
                coachProfileImageUrl,
                recentGameTitle,
                recentGameDescription,
                seasonNumber,
                seasonDetail,
                seasonImageUrl,
                sport,
            });
            const savedDetailSport = await detailSportRepository.save(newDetailSport);
            res.status(201).json(savedDetailSport);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to create detail sport' });
        }
    }

    static async updateDetailSport(req: Request, res: Response) {
        const { id } = req.params;
        const {
            bannerTitle,
            coachName,
            coachDescription,
            recentGameTitle,
            recentGameDescription,
            seasonNumber,
            seasonDetail,
        } = req.body;
        const detailSportRepository = AppDataSource.getRepository(DetailSport);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        try {
            const detailSport = await detailSportRepository.findOneBy({ id: Number(id) });
            if (!detailSport) {
                return res.status(404).json({ message: 'Detail sport not found' });
            }

            if (files.bannerImage) {
                // Delete old image if exists
                if (detailSport.bannerImageUrl) {
                    const oldImagePath = path.join(UPLOADS_FOLDER, '..', detailSport.bannerImageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                detailSport.bannerImageUrl = `/uploads/images/${files.bannerImage[0].filename}`;
            }

            if (files.coachProfileImage) {
                if (detailSport.coachProfileImageUrl) {
                    const oldImagePath = path.join(UPLOADS_FOLDER, '..', detailSport.coachProfileImageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                detailSport.coachProfileImageUrl = `/uploads/images/${files.coachProfileImage[0].filename}`;
            }

            if (files.seasonImage) {
                if (detailSport.seasonImageUrl) {
                    const oldImagePath = path.join(UPLOADS_FOLDER, '..', detailSport.seasonImageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                detailSport.seasonImageUrl = `/uploads/images/${files.seasonImage[0].filename}`;
            }

            detailSport.bannerTitle = bannerTitle;
            detailSport.coachName = coachName;
            detailSport.coachDescription = coachDescription;
            detailSport.recentGameTitle = recentGameTitle;
            detailSport.recentGameDescription = recentGameDescription;
            detailSport.seasonNumber = seasonNumber;
            detailSport.seasonDetail = seasonDetail;
            const updatedDetailSport = await detailSportRepository.save(detailSport);
            res.status(200).json(updatedDetailSport);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update detail sport' });
        }
    }

    static async deleteDetailSport(req: Request, res: Response) {
        const { id } = req.params;
        const detailSportRepository = AppDataSource.getRepository(DetailSport);

        try {
            const detailSport = await detailSportRepository.findOneBy({ id: Number(id) });
            if (!detailSport) {
                return res.status(404).json({ message: 'Detail sport not found' });
            }

            // Delete image if exists
            if (detailSport.bannerImageUrl) {
                const imagePath = path.join(UPLOADS_FOLDER, '..', detailSport.bannerImageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await detailSportRepository.remove(detailSport);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete detail sport' });
        }
    }

    static async getLastSeasons(req: Request, res: Response) {
        const { limit = 3 } = req.query; // Default to 3 records if not provided
        const detailSportRepository = AppDataSource.getRepository(DetailSport);

        try {
            const lastSeasons = await detailSportRepository.find({
                order: {
                    updatedAt: 'DESC',
                },
                take: Number(limit),
                select: ['seasonNumber', 'seasonDetail', 'seasonImageUrl'],
            });
            res.status(200).json(lastSeasons);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to fetch last seasons' });
        }
    }
}

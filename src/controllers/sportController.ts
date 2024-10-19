import { Request, Response } from 'express';
import { Sport } from '../entities/Sport';
import { Season } from '../entities/Season';
import AppDataSource from '../database/data-source';
import path from 'path';
import fs from 'fs';
import { UPLOADS_FOLDER } from '../config/filePaths';
import { DetailSport } from '../entities/DetailSport';

export class SportController {
    static async createSport(req: Request, res: Response) {
        const { sportName, seasonId } = req.body;
        const sportRepository = AppDataSource.getRepository(Sport);
        const seasonRepository = AppDataSource.getRepository(Season);
        const file = req.file;

        try {
            const season = await seasonRepository.findOneBy({ id: seasonId });
            if (!season) {
                return res.status(404).json({ message: 'Season not found' });
            }

            const imageUrl = file ? `/uploads/images/${file.filename}` : '';
            const newSport = sportRepository.create({
                sportName,
                imageUrl,
                season,
            });
            const savedSport = await sportRepository.save(newSport);
            res.status(201).json(savedSport);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to create sport' });
        }
    }

    static async updateSport(req: Request, res: Response) {
        const { id } = req.params;
        const { sportName } = req.body;
        const sportRepository = AppDataSource.getRepository(Sport);
        const file = req.file;

        try {
            const sport = await sportRepository.findOneBy({ id: Number(id) });
            if (!sport) {
                return res.status(404).json({ message: 'Sport not found' });
            }

            if (file) {
                // Delete old image if exists
                if (sport.imageUrl) {
                    const oldImagePath = path.join(UPLOADS_FOLDER, '..', sport.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                sport.imageUrl = `/uploads/images/${file.filename}`;
            }

            sport.sportName = sportName;
            const updatedSport = await sportRepository.save(sport);
            res.status(200).json(updatedSport);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update sport' });
        }
    }

    static async deleteSport(req: Request, res: Response) {
        const { id } = req.params;
        const sportRepository = AppDataSource.getRepository(Sport);
        const detailSportRepository = AppDataSource.getRepository(DetailSport);

        try {
            const sport = await sportRepository.findOneBy({ id: Number(id) });
            if (!sport) {
                return res.status(404).json({ message: 'Sport not found' });
            }

            // Find and delete all related detail sports
            const detailSports = await detailSportRepository.find({ where: { sport: { id: Number(id) } } });
            for (const detailSport of detailSports) {
                // Delete related awards
                const awards = await AppDataSource.getRepository('Award').find({
                    where: { detailSport: { id: detailSport.id } },
                });
                for (const award of awards) {
                    await AppDataSource.getRepository('Award').remove(award);
                }
                await detailSportRepository.remove(detailSport);
            }

            // Delete sport image if exists
            if (sport.imageUrl) {
                const imagePath = path.join(UPLOADS_FOLDER, '..', sport.imageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Delete the sport itself
            await sportRepository.remove(sport);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete sport' });
        }
    }
}

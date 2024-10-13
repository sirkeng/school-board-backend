import { Request, Response } from 'express';
import { Season } from '../entities/Season';
import { Sport } from '../entities/Sport';
import AppDataSource from '../database/data-source';

export class SportController {
    static async createSport(req: Request, res: Response) {
        const { sportName, seasonId } = req.body;
        const sportRepository = AppDataSource.getRepository(Sport);
        const seasonRepository = AppDataSource.getRepository(Season);
        const file = req.file as Express.MulterS3.File;

        try {
            const season = await seasonRepository.findOneBy({ id: seasonId });
            if (!season) {
                return res.status(404).json({ message: 'Season not found' });
            }

            const newSport = sportRepository.create({
                sportName,
                imageUrl: file.location,
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
        const file = req.file as Express.MulterS3.File;

        try {
            const sport = await sportRepository.findOneBy({ id: Number(id) });
            if (!sport) {
                return res.status(404).json({ message: 'Sport not found' });
            }

            sport.sportName = sportName;
            if (file) {
                sport.imageUrl = file.location;
            }
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

        try {
            const sport = await sportRepository.findOneBy({ id: Number(id) });
            if (!sport) {
                return res.status(404).json({ message: 'Sport not found' });
            }

            await sportRepository.remove(sport);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete sport' });
        }
    }
}

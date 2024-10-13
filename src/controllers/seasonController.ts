import { Request, Response } from 'express';
import { Season } from '../entities/Season';
import AppDataSource from '../database/data-source';

export class SeasonController {
    static async createSeason(req: Request, res: Response) {
        const { seasonName } = req.body;
        const seasonRepository = AppDataSource.getRepository(Season);

        try {
            const newSeason = seasonRepository.create({ seasonName });
            const savedSeason = await seasonRepository.save(newSeason);
            res.status(201).json(savedSeason);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to create season' });
        }
    }

    static async getAllSeasons(req: Request, res: Response) {
        const seasonRepository = AppDataSource.getRepository(Season);

        try {
            const seasons = await seasonRepository.find({ relations: ['sports'] });
            res.status(200).json(seasons);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to retrieve seasons' });
        }
    }

    static async updateSeason(req: Request, res: Response) {
        const { id } = req.params;
        const { seasonName } = req.body;
        const seasonRepository = AppDataSource.getRepository(Season);

        try {
            const season = await seasonRepository.findOneBy({ id: Number(id) });
            if (!season) {
                return res.status(404).json({ message: 'Season not found' });
            }

            season.seasonName = seasonName;
            const updatedSeason = await seasonRepository.save(season);
            res.status(200).json(updatedSeason);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update season' });
        }
    }

    static async deleteSeason(req: Request, res: Response) {
        const { id } = req.params;
        const seasonRepository = AppDataSource.getRepository(Season);

        try {
            const season = await seasonRepository.findOneBy({ id: Number(id) });
            if (!season) {
                return res.status(404).json({ message: 'Season not found' });
            }

            await seasonRepository.remove(season);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete season' });
        }
    }
}

import { Request, Response } from 'express';
import { DetailSport } from '../entities/DetailSport';
import { RecentGame } from '../entities/RecentGame';
import AppDataSource from '../database/data-source';

export class RecentGameController {
    static async createRecentGame(req: Request, res: Response) {
        const { title, description, location, timestamp, detailSportId } = req.body;
        const recentGameRepository = AppDataSource.getRepository(RecentGame);
        const detailSportRepository = AppDataSource.getRepository(DetailSport);

        try {
            const detailSport = await detailSportRepository.findOneBy({ id: detailSportId });
            if (!detailSport) {
                return res.status(404).json({ message: 'Detail sport not found' });
            }

            const newRecentGame = recentGameRepository.create({
                title,
                description,
                location,
                timestamp,
                detailSport,
            });
            const savedRecentGame = await recentGameRepository.save(newRecentGame);
            res.status(201).json(savedRecentGame);
        } catch (error) {
            console.error('createRecentGame', error);
            res.status(400).json({ message: 'Failed to create recent game' });
        }
    }

    static async updateRecentGame(req: Request, res: Response) {
        const { id } = req.params;
        const { title, description, location, timestamp } = req.body;
        const recentGameRepository = AppDataSource.getRepository(RecentGame);

        try {
            const recentGame = await recentGameRepository.findOneBy({ id: Number(id) });
            if (!recentGame) {
                return res.status(404).json({ message: 'Recent game not found' });
            }

            recentGame.title = title;
            recentGame.description = description;
            recentGame.location = location;
            recentGame.timestamp = timestamp;
            const updatedRecentGame = await recentGameRepository.save(recentGame);
            res.status(200).json(updatedRecentGame);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update recent game' });
        }
    }

    static async deleteRecentGame(req: Request, res: Response) {
        const { id } = req.params;
        const recentGameRepository = AppDataSource.getRepository(RecentGame);

        try {
            const recentGame = await recentGameRepository.findOneBy({ id: Number(id) });
            if (!recentGame) {
                return res.status(404).json({ message: 'Recent game not found' });
            }

            await recentGameRepository.remove(recentGame);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete recent game' });
        }
    }
}

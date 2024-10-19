import { Request, Response } from 'express';
import { DetailSport } from '../entities/DetailSport';
import { Award } from '../entities/Award';
import AppDataSource from '../database/data-source';

export class AwardController {
    static async createAward(req: Request, res: Response) {
        const { title, description, detailSportId } = req.body;
        const awardRepository = AppDataSource.getRepository(Award);
        const detailSportRepository = AppDataSource.getRepository(DetailSport);

        try {
            const detailSport = await detailSportRepository.findOneBy({ sport: { id: detailSportId } });
            if (!detailSport) {
                return res.status(404).json({ message: 'Detail sport not found' });
            }

            const newAward = awardRepository.create({
                title,
                description,
                detailSport,
            });
            const savedAward = await awardRepository.save(newAward);
            res.status(201).json(savedAward);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to create award' });
        }
    }

    static async updateAward(req: Request, res: Response) {
        const { id } = req.params;
        const { title, description } = req.body;
        const awardRepository = AppDataSource.getRepository(Award);

        try {
            const award = await awardRepository.findOneBy({ id: Number(id) });
            if (!award) {
                return res.status(404).json({ message: 'Award not found' });
            }

            award.title = title;
            award.description = description;
            const updatedAward = await awardRepository.save(award);
            res.status(200).json(updatedAward);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update award' });
        }
    }

    static async deleteAward(req: Request, res: Response) {
        const { id } = req.params;
        const awardRepository = AppDataSource.getRepository(Award);

        try {
            const award = await awardRepository.findOneBy({ id: Number(id) });
            if (!award) {
                return res.status(404).json({ message: 'Award not found' });
            }

            await awardRepository.remove(award);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete award' });
        }
    }
}

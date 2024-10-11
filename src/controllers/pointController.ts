import { Request, Response } from 'express';
import AppDataSource from '../database/data-source';
import { Point } from '../entities/Point';
import { Between, In } from 'typeorm';

export class PointController {
    // Create teams, events, and scores
    static addPoints = async (req: Request, res: Response) => {
        const { teamNames, event, scores, date } = req.body;
        const pointRepository = AppDataSource.getRepository(Point);

        try {
            // Create multiple scores at once
            const newPoints = teamNames.map((teamName: string, index: number) => {
                return pointRepository.create({
                    team: teamName,
                    event: event,
                    score: scores[index],
                    date: date,
                });
            });

            const points = await pointRepository.save(newPoints);
            return res.status(200).json({ message: 'Score creation successful', points });
        } catch (error) {
            res.status(500).json({ message: 'Score creation failed' });
        }
    };

    // Retrieve teams, events, and scores
    static getAllPoints = async (req: Request, res: Response) => {
        const year = req.query.year;
        const pointRepository = AppDataSource.getRepository(Point);

        // Define the period to show the scoreboard (the specified year)
        const startDate = new Date(`${year}-08-01`);
        const endDate = new Date(`${year}-07-31`);
        endDate.setFullYear(endDate.getFullYear() + 1); // Set endDate to the next year

        try {
            // Retrieve scores in the order recorded by teams
            const scores = await pointRepository.find({
                where: {
                    date: Between(startDate, endDate),
                },
                order: { id: 'ASC' },
            });

            const totalScores = await pointRepository
                .createQueryBuilder('points')
                .select('points.team')
                .addSelect('SUM(points.score)', 'totalScore')
                .where('points.date BETWEEN :startDate AND :endDate', { startDate, endDate })
                .groupBy('points.team')
                .orderBy('MIN(points.id)', 'ASC') // Sort by minimum id
                .getRawMany();

            res.status(200).json({ scores, totalScores });
        } catch (error) {
            console.error(error);
            res.status(404).json({ message: 'Failed to retrieve Grade Points.' });
        }
    };

    // Update teams, events, and scores
    static updatePoints = async (req: Request, res: Response) => {
        const { pointsId, teamNames, event, scores, date } = req.body;
        const pointRepository = AppDataSource.getRepository(Point);

        try {
            // Create an array of points to update
            const pointsToUpdate = await Promise.all(
                pointsId.map(async (id: number, index: number) => {
                    const point = await pointRepository.findOne({ where: { id } });

                    if (point) {
                        point.team = teamNames[index];
                        point.event = event;
                        point.score = scores[index];
                        point.date = date;
                        return point;
                    } else {
                        throw new Error('Point not found.');
                    }
                }),
            );

            const updatedPoints = await pointRepository.save(pointsToUpdate);
            res.status(200).json({ message: 'Points successfully updated.', updatedPoints });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Score update failed' });
        }
    };

    // Delete teams, events, and scores
    static deletePoints = async (req: Request, res: Response) => {
        const { pointsId } = req.body;
        const pointRepository = AppDataSource.getRepository(Point);

        try {
            const pointsToDelete = await pointRepository.findBy({ id: In(pointsId) });

            if (pointsToDelete.length !== pointsId.length) {
                return res.status(404).json({ message: 'Some scores not found.' });
            }

            await pointRepository.remove(pointsToDelete);

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Score deletion failed' });
        }
    };
}

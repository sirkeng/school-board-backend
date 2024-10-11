import { Request, Response } from 'express';
import AppDataSource from '../database/data-source';
import { Coach } from '../entities/Coach';

export class CoachController {
    static createCoach = async (req: Request, res: Response) => {
        const { categoryId, year, season, name, description } = req.body;

        // Validation check
        if (!categoryId || !year || !season || !name || !description) {
            return res.status(400).json({ message: 'Please fill in all fields.' });
        }

        try {
            const coachRepository = AppDataSource.getRepository(Coach);

            const newCoach = coachRepository.create({
                categoryId,
                year,
                season,
                name,
                description,
            });

            await coachRepository.save(newCoach);

            res.status(201).json({ message: 'Coach has been successfully created.', coach: newCoach });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to create coach' });
        }
    };

    // Retrieve coach (Get the coach for a specific year and season)
    static getCoach = async (req: Request, res: Response) => {
        const { categoryId, year, season } = req.body;

        const coachRepository = AppDataSource.getRepository(Coach);

        try {
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({ message: 'Please enter a valid year.' });
            }

            const coach = await coachRepository.findOne({ where: { categoryId, year, season } });

            if (!coach) {
                return res.status(404).json({ message: 'The coach could not be found.' });
            }

            res.status(200).json(coach);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to retrieve coach' });
        }
    };

    static updateCoach = async (req: Request, res: Response) => {
        const { id } = req.params; // Coach ID
        const { categoryId, year, season, name, description } = req.body;

        const coachRepository = AppDataSource.getRepository(Coach);

        try {
            const coach = await coachRepository.findOne({ where: { id: Number(id) } });

            if (coach) {
                coach.categoryId = categoryId;
                coach.year = year;
                coach.season = season;
                coach.name = name;
                coach.description = description;
            } else {
                res.status(404).json({ message: 'Coach not found' });
            }

            await coachRepository.save(coach);

            res.status(200).json({ message: 'Coach information has been updated.', coach });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update coach' });
        }
    };

    static deleteCoach = async (req: Request, res: Response) => {
        const { id } = req.params;

        const coachRepository = AppDataSource.getRepository(Coach);

        try {
            const coach = await coachRepository.findOne({ where: { id: Number(id) } });

            if (!coach) {
                return res.status(404).json({ message: 'Coach not found.' });
            }

            await coachRepository.remove(coach);

            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete coach' });
        }
    };
}

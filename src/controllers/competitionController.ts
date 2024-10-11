import { Request, Response } from 'express';
import AppDataSource from '../database/data-source';
import { Competition } from '../entities/Competition';
import moment from 'moment-timezone';
import { config } from './config/config';
import { Competitor } from '../entities/Competitor';
import { Category } from '../entities/Category';

export class CompetitionController {
    // Create competition information
    static createCompetition = async (req: Request, res: Response) => {
        const userId = req.user.userId;
        const { boardId, categoryId, name, date, competitors, type, award, result } = req.body;
        const competitionRepository = AppDataSource.getRepository(Competition);
        const competitorRepository = AppDataSource.getRepository(Competitor);

        const newCompetition = competitionRepository.create({
            userId,
            boardId,
            categoryId,
            name,
            date: new Date(date),
            type,
            award,
            result,
        });

        try {
            await competitionRepository.save(newCompetition);

            // Create competitors data
            if (competitors && competitors.length > 0) {
                const newCompetitors = competitors.map((competitor: any) => {
                    return competitorRepository.create({
                        competition: newCompetition,
                        name: competitor.name,
                        score: competitor.score,
                    });
                });

                await competitorRepository.save(newCompetitors);
            }

            // Retrieve the newly created competition along with related Competitor data
            const savedCompetition = await competitionRepository.findOne({
                where: { id: newCompetition.id },
                relations: ['competitors'], // Specify relationships to include related data
            });

            res.status(201).json(savedCompetition);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to create competition information' });
        }
    };

    // Retrieve all competition information
    // The number of competitions displayed can be defined on the frontend
    static getCompetitionsOnScoreBoard = async (req: Request, res: Response) => {
        const competitionRepository = AppDataSource.getRepository(Competition);

        try {
            const competitions = await competitionRepository.find({
                order: { date: 'DESC' },
                relations: ['competitors'], // Retrieve Competitors data as well
            });

            const localTimeCompetitions = competitions.map(competition => ({
                ...competition,
                date: moment.tz(competition.date, config.timezone).format('YYYY-MM-DD'),
            }));

            res.status(200).json(localTimeCompetitions);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve competition information' });
        }
    };

    // Retrieve the top 3 competitions for each category ID
    static getTopThreeCompetition = async (req: Request, res: Response) => {
        const categoryId = Number(req.params.categoryId);
        const competitionRepository = AppDataSource.getRepository(Competition);
        const categoryRepository = AppDataSource.getRepository(Category);

        try {
            // Check if the category exists
            const category = await categoryRepository.findOne({ where: { id: categoryId } });
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            // Retrieve the latest 3 competitions belonging to the category
            const topCompetitions = await competitionRepository.find({
                where: { categoryId },
                order: {
                    date: 'DESC',
                },
                take: 3,
                relations: ['competitors'], // Retrieve Competitors and Category data as well
            });

            if (topCompetitions.length > 0) {
                const localTimeCompetitions = topCompetitions.map(competition => ({
                    ...competition,
                    date: moment.tz(competition.date, config.timezone).format('YYYY-MM-DD'),
                }));

                res.status(200).json({ competitions: localTimeCompetitions });
            } else {
                res.status(404).json({ message: 'Competition information not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to retrieve competition information' });
        }
    };

    // Update competition information
    static updateCompetition = async (req: Request, res: Response) => {
        const competitionId = Number(req.params.id);
        const { name, date, competitors, type, award, result } = req.body;
        const competitionRepository = AppDataSource.getRepository(Competition);
        const competitorRepository = AppDataSource.getRepository(Competitor);

        try {
            const competition = await competitionRepository.findOne({
                where: { id: competitionId },
                relations: ['competitors'],
            });

            if (competition) {
                competition.name = name;
                competition.date = new Date(date);
                competition.type = type;
                competition.competitors = competitors;
                competition.award = award;
                competition.result = result;

                await competitionRepository.save(competition);

                // Delete existing Competitors and create new ones
                if (competitors && competitors.length > 0) {
                    await competitorRepository.delete({ competition: competition });

                    const newCompetitors = competitors.map((competitor: any) => {
                        return competitorRepository.create({
                            competition: competition,
                            score: competitor.score,
                        });
                    });

                    await competitorRepository.save(newCompetitors);
                }
                res.status(200).json(competition);
            } else {
                res.status(404).json({ message: 'Competition information not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to update competition information' });
        }
    };

    // Delete competition information
    static deleteCompetition = async (req: Request, res: Response) => {
        const competitionId = Number(req.params.id);
        const competitionRepository = AppDataSource.getRepository(Competition);
        const competitorRepository = AppDataSource.getRepository(Competitor);

        try {
            const competition = await competitionRepository.findOne({
                where: { id: competitionId },
                relations: ['competitors'],
            });

            if (competition) {
                await competitorRepository.delete({ competition: competition });
                await competitionRepository.remove(competition);
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Competition information not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete competition information' });
        }
    };
}

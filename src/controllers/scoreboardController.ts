// src/controllers/scoreboardController.ts
import { Request, Response } from 'express';
import { Scoreboard } from '../entities/Scoreboard';
import AppDataSource from '../database/data-source';

export class ScoreboardController {
    // Create a scoreboard entry
    static async createScoreboard(req: Request, res: Response) {
        const { sportName, firstTeam, secondTeam, firstTeamScore, secondTeamScore, liveLink } = req.body;
        const scoreboardRepository = AppDataSource.getRepository(Scoreboard);

        const newScoreboard = scoreboardRepository.create({
            sportName,
            firstTeam,
            secondTeam,
            firstTeamScore,
            secondTeamScore,
            liveLink,
        });

        try {
            const savedScoreboard = await scoreboardRepository.save(newScoreboard);
            res.status(201).json(savedScoreboard);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to create scoreboard' });
        }
    }

    // Get all scoreboards
    static async getAllScoreboards(req: Request, res: Response) {
        const scoreboardRepository = AppDataSource.getRepository(Scoreboard);

        try {
            const scoreboards = await scoreboardRepository.find();
            res.status(200).json(scoreboards);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to retrieve scoreboards' });
        }
    }

    // Update scoreboard by ID
    static async updateScoreboard(req: Request, res: Response) {
        const { id } = req.params;
        const { sportName, firstTeam, secondTeam, firstTeamScore, secondTeamScore, liveLink } = req.body;
        const scoreboardRepository = AppDataSource.getRepository(Scoreboard);

        try {
            const scoreboard = await scoreboardRepository.findOneBy({ id: Number(id) });
            if (!scoreboard) {
                return res.status(404).json({ message: 'Scoreboard not found' });
            }

            // Update the scoreboard properties
            scoreboard.sportName = sportName;
            scoreboard.firstTeam = firstTeam;
            scoreboard.secondTeam = secondTeam;
            scoreboard.firstTeamScore = firstTeamScore;
            scoreboard.secondTeamScore = secondTeamScore;
            scoreboard.liveLink = liveLink;

            const updatedScoreboard = await scoreboardRepository.save(scoreboard);
            res.status(200).json(updatedScoreboard);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update scoreboard' });
        }
    }

    // Delete scoreboard by ID
    static async deleteScoreboard(req: Request, res: Response) {
        const { id } = req.params;
        const scoreboardRepository = AppDataSource.getRepository(Scoreboard);

        try {
            const scoreboard = await scoreboardRepository.findOneBy({ id: Number(id) });
            if (!scoreboard) {
                return res.status(404).json({ message: 'Scoreboard not found' });
            }

            await scoreboardRepository.remove(scoreboard);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete scoreboard' });
        }
    }
}

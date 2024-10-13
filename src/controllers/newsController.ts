import { Request, Response } from 'express';
import { News } from '../entities/News';
import AppDataSource from '../database/data-source';

export class NewsController {
    // Create a news article
    static async createNews(req: Request, res: Response) {
        const { title, content, location, timestamp } = req.body;
        const newsRepository = AppDataSource.getRepository(News);

        const newNews = newsRepository.create({ title, content, location, timestamp });

        try {
            const savedNews = await newsRepository.save(newNews);
            res.status(201).json(savedNews);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to create news' });
        }
    }

    // Get all news
    static async getAllNews(req: Request, res: Response) {
        const newsRepository = AppDataSource.getRepository(News);

        try {
            const newsList = await newsRepository.find();
            res.status(200).json(newsList);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to retrieve news' });
        }
    }

    // Update news by ID
    static async updateNews(req: Request, res: Response) {
        const { id } = req.params;
        const { title, content, location, timestamp } = req.body;
        const newsRepository = AppDataSource.getRepository(News);

        try {
            const news = await newsRepository.findOneBy({ id: Number(id) });
            if (!news) {
                return res.status(404).json({ message: 'News not found' });
            }

            news.title = title;
            news.content = content;
            news.location = location;
            news.timestamp = timestamp;

            const updatedNews = await newsRepository.save(news);
            res.status(200).json(updatedNews);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update news' });
        }
    }

    // Delete news by ID
    static async deleteNews(req: Request, res: Response) {
        const { id } = req.params;
        const newsRepository = AppDataSource.getRepository(News);

        try {
            const news = await newsRepository.findOneBy({ id: Number(id) });
            if (!news) {
                return res.status(404).json({ message: 'News not found' });
            }

            await newsRepository.remove(news);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete news' });
        }
    }
}

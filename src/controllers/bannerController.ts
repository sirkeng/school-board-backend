import { Request, Response } from 'express';
import { Banner } from '../entities/Banner';
import AppDataSource from '../database/data-source';
import path from 'path';
import fs from 'fs';
import { UPLOADS_FOLDER } from '../config/filePaths';

export class BannerController {
    static async createBanner(req: Request, res: Response) {
        const { title } = req.body;
        const bannerRepository = AppDataSource.getRepository(Banner);
        const file = req.file;

        try {
            const videoUrl = file ? `/uploads/videos/${file.filename}` : '';
            const newBanner = bannerRepository.create({
                title,
                videoUrl,
            });
            const savedBanner = await bannerRepository.save(newBanner);
            res.status(201).json(savedBanner);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Failed to create banner' });
        }
    }

    static async updateBanner(req: Request, res: Response) {
        const { id } = req.params;
        const { title } = req.body;
        const bannerRepository = AppDataSource.getRepository(Banner);
        const file = req.file;

        try {
            const banner = await bannerRepository.findOneBy({ id: Number(id) });
            if (!banner) {
                return res.status(404).json({ message: 'Banner not found' });
            }

            if (file) {
                // Delete old video if exists
                if (banner.videoUrl) {
                    const oldVideoPath = path.join(UPLOADS_FOLDER, '..', banner.videoUrl);
                    console.log('oldVideoPath', oldVideoPath);
                    if (fs.existsSync(oldVideoPath)) {
                        fs.unlinkSync(oldVideoPath);
                    }
                }
                banner.videoUrl = `/uploads/videos/${file.filename}`;
            }

            banner.title = title;
            const updatedBanner = await bannerRepository.save(banner);
            res.status(200).json(updatedBanner);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update banner' });
        }
    }

    static async deleteBanner(req: Request, res: Response) {
        const { id } = req.params;
        const bannerRepository = AppDataSource.getRepository(Banner);

        try {
            const banner = await bannerRepository.findOneBy({ id: Number(id) });
            if (!banner) {
                return res.status(404).json({ message: 'Banner not found' });
            }

            // Delete video if exists
            if (banner.videoUrl) {
                const videoPath = path.join(UPLOADS_FOLDER, '..', banner.videoUrl);
                if (fs.existsSync(videoPath)) {
                    fs.unlinkSync(videoPath);
                }
            }

            await bannerRepository.remove(banner);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete banner' });
        }
    }

    static async getBanner(req: Request, res: Response) {
        const bannerRepository = AppDataSource.getRepository(Banner);

        try {
            const banners = await bannerRepository.find();
            if (banners.length > 0) {
                res.status(200).json(banners[0]);
            } else {
                res.status(200).json(null);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to get banner' });
        }
    }
}

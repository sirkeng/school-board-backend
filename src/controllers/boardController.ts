import { Request, Response } from 'express';
import AppDataSource from '../database/data-source';
import { Board } from '../entities/Board';

class BoardController {
    static getBoardById = async (req: Request, res: Response) => {
        const boardId = Number(req.params.id);
        const boardRepository = AppDataSource.getRepository(Board);

        try {
            // Retrieve the category
            const board = await boardRepository.findOne({ where: { id: boardId } });

            if (board) {
                // Return the category name
                res.status(200).json({ name: board.name });
            } else {
                // If the category does not exist
                res.status(404).json({ message: 'Category not found.' });
            }
        } catch (error) {
            // Handle the error
            res.status(500).json({ message: 'Failed to retrieve category name', error: error.message });
        }
    };
}

export default BoardController;

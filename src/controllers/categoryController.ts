import { Request, Response } from 'express';
import AppDataSource from '../database/data-source';
import { Category } from '../entities/Category';

class CategoryController {
    // Retrieve category name
    static getCategoryById = async (req: Request, res: Response) => {
        const categoryId = Number(req.params.id);
        const categoryRepository = AppDataSource.getRepository(Category);

        try {
            // Retrieve the category
            const category = await categoryRepository.findOne({ where: { id: categoryId } });

            if (category) {
                // Return the category name
                res.status(200).json({ name: category.name });
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

export default CategoryController;


import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import postRoutes from './routes/posts';
import commentRoutes from './routes/comments';
import likeRoutes from './routes/likes';
import competitionRoutes from './routes/competitions';
import carouselRoutes from './routes/carousels';
import fileRoutes from './routes/files';
import pointRoutes from './routes/points';
import AppDataSource from './database/data-source';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import boardRoutes from './routes/boards';
import categoryRoutes from './routes/categories';
import coachRoutes from './routes/coach';
import { RoleType } from './entities/enums/RoleType';
import news from './routes/news';
import scoreboard from './routes/scoreboard';
import season from './routes/season';
import banner from './routes/banner';
import detailSport from './routes/detailSport';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number | undefined;
                role: RoleType | undefined;
            };
        }
    }
}

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/boards', boardRoutes);
app.use('/categories', categoryRoutes);
app.use('/posts', postRoutes);
app.use('/', commentRoutes);
app.use('/likes', likeRoutes);
app.use('/competitions', competitionRoutes);
app.use('/carousels', carouselRoutes);
app.use('/files', fileRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/points', pointRoutes);
app.use('/coach', coachRoutes);
app.use('/news', news);
app.use('/scoreboard', scoreboard);
app.use('/season', season);
app.use('/banner', banner);
app.use('/detail-sport', detailSport);

// 기본 페이지
app.get('/', (req, res) => {
    res.send('Hello, this is the main page.');
});

AppDataSource.initialize()
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch(error => console.log(error));

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

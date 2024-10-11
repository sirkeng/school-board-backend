import { Router } from 'express';
import { CoachController } from '../controllers/coachController';

const router = Router();

router.post('/', CoachController.createCoach); // 게시판 이름 알아내기
router.get('/', CoachController.getCoach); // 게시판 이름 알아내기
router.put('/:id', CoachController.updateCoach); // 게시판 이름 알아내기
router.delete('/:id', CoachController.deleteCoach); // 게시판 이름 알아내기

export default router;

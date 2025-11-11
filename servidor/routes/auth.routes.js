import { Router } from 'express';
import { registerUser, loginUser, confirmEmailDev } from '../controllers/auth.controller.js';

const router = Router();

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/dev/confirm-email', confirmEmailDev);

export default router;
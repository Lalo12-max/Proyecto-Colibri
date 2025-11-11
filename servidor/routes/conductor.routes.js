import { Router } from 'express';
import { registerConductor, loginConductor } from '../controllers/conductor.controller.js';

const router = Router();

router.post('/conductor/register', registerConductor);
router.post('/conductor/login', loginConductor);

export default router;
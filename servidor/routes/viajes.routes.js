import { Router } from 'express';
import {
  createViaje,
  listDisponibles,
  createPunto,
  listCatalogo,
  listByConductor,
  listZonas,
  listPuntosByConductor,
} from '../controllers/viajes.controller.js';

const router = Router();

router.post('/viajes', createViaje);
router.get('/viajes/disponibles', listDisponibles);
router.get('/viajes/catalogo', listCatalogo);
router.post('/puntos', createPunto);
router.get('/puntos/conductor/:conductorId', listPuntosByConductor);
router.get('/puntos/zonas', listZonas);

export default router;
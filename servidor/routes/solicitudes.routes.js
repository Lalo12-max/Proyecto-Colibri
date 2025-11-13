import { Router } from 'express';
import {
  crearSolicitud,
  listarPendientesConductor,
  cotizarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  actualizarEstadoCliente,
  listarSolicitudesCliente,
  listarSolicitudesConductorAsignadas,
  iniciarSolicitud,
  finalizarSolicitud,
} from '../controllers/solicitudes.controller.js';

const router = Router();

router.post('/solicitudes', crearSolicitud);
router.get('/solicitudes/conductor/:conductorId', listarPendientesConductor);
router.get('/solicitudes/conductor/:conductorId/mias', listarSolicitudesConductorAsignadas);
router.patch('/solicitudes/:id/cotizar', cotizarSolicitud);
router.patch('/solicitudes/:id/aceptar', aceptarSolicitud);
router.patch('/solicitudes/:id/rechazar', rechazarSolicitud);
router.patch('/solicitudes/:id/iniciar', iniciarSolicitud);
router.patch('/solicitudes/:id/finalizar', finalizarSolicitud);
router.patch('/solicitudes/:id/estado', actualizarEstadoCliente);
router.get('/solicitudes/cliente/:email', listarSolicitudesCliente);

export default router;
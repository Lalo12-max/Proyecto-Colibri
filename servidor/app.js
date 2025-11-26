import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import conductorRoutes from './routes/conductor.routes.js';
import viajesRoutes from './routes/viajes.routes.js';
import solicitudesRoutes from './routes/solicitudes.routes.js';
import { requireAuth } from './middleware/auth.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'capacitor://app'

];

const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()) : [])
];

app.use(express.json());
app.use(requestLogger);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / herramientas
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origen no permitido por CORS'), false);
    },
  })
);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/', authRoutes);
app.use('/', conductorRoutes);
// Montamos viajes en raíz para conservar los paths actuales: /viajes/* y /puntos
app.use('/', viajesRoutes);
app.use('/', solicitudesRoutes);
app.use('/viajes', requireAuth); // ejemplo si quieres proteger creación/edición

export default app;

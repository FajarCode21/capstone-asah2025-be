import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

import cors from 'cors';
import 'dotenv/config';

import AppError from './utils/AppError.js';
import { errorHandler } from './middleware/errorHandler.js';
import Routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;
const swaggerDocument = JSON.parse(
  fs.readFileSync('./src/swagger.json', 'utf-8')
);

app.use(express.json({ limit: '5mb' }));
app.use(
  cors({
    origin: 'https://capstone-asah2025-fe.vercel.app',
    credentials: true,
  })
);

app.use(Routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Tidak dapat menemukan ${req.originalUrl}`, 404));
});

app.use(errorHandler);

console.log('Starting server...');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port:${PORT}`);
});

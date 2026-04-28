import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import { healthRouter } from './routes/health';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3333);
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use('/api/health', healthRouter);

async function bootstrap() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  }

  app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('API failed to start', error);
  process.exit(1);
});

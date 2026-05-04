import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

import { closeNeo4jDriver, verifyNeo4jConnectivity } from './config/neo4j';
import { graphRouter } from './routes/graph';
import { healthRouter } from './routes/health';
import { peopleRouter } from './routes/people';
import { relationshipsRouter } from './routes/relationships';
import { mergeRouter } from './routes/merge';
import { activityRouter } from './routes/activity';
import { adminRouter } from './routes/admin';
import { ensureGraphSchema } from './services/graphSchemaService';

dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });
dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3333);
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/graph', graphRouter);
app.use('/api/people', peopleRouter);
app.use('/api/relationships', relationshipsRouter);
app.use('/api/merge', mergeRouter);
app.use('/api/activity', activityRouter);
app.use('/api/admin', adminRouter);

async function bootstrap() {
  if (process.env.NEO4J_URI) {
    await verifyNeo4jConnectivity();
    await ensureGraphSchema();
    console.log('Connected to Neo4j');
  }

  const server = app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
  });

  async function shutdown() {
    server.close(async () => {
      try {
        await closeNeo4jDriver();
      } finally {
        process.exit(0);
      }
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('API failed to start', error);
  process.exit(1);
});

import express from 'express';
import cors from 'cors';
import { helpRequestRoutes } from './routes/helpRequests.js';
import { reportRoutes } from './routes/reports.js';
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/requests', helpRequestRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

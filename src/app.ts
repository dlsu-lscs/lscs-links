import express from 'express';
import cors from 'cors';
import path from 'path';
import adminRoutes from './routes/admin.routes';
import linksRoutes from './routes/links.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(express.json());
app.use('/admin', adminRoutes);
app.use('/', linksRoutes);
app.use('/analytics', analyticsRoutes);

export default app;

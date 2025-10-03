import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/admin', adminRoutes);

export default app;

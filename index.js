import 'dotenv/config';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

import linkRoute from './routes/link.js';
import adminRoute from './routes/admin.js';
import userRoute from './routes/user.js'; // Deprecated for Google login
import analyticsRoute from './routes/analytics.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', linkRoute);
app.use('/admin', adminRoute);
app.use('/auth', userRoute);
app.use('/analytics', analyticsRoute);

mongoose.connect(process.env.DB_URL)
  .then(() => console.log("[LSCSlinks] Connected to MongoDB Database successfully."))
  .catch((e) => console.error(`[LSCSlinks] Connection to MongoDB Database failed. Error: ${e}`));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[LSCSlinks] Server started. (Listening on port: ${PORT})`);
});


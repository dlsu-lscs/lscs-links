import app from './app';
import config from './config/config';
import connectDB from './config/db';

connectDB();

app.use(app);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

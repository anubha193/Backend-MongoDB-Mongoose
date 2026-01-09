import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './index.js'

connectDB().then(() => {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());

  // Sample route
  app.get('/', (req, res) => {
    res.send('MongoDB Backend is running!');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to the database", err);
});
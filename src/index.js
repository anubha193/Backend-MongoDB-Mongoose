import dotenv from 'dotenv';
import connectDB from './db/index.js'
import {app} from './app.js'

dotenv.config({
  path:".env",
  debug: true
})
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to the database", err);
});
export default connectDB;

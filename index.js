import express from 'express';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Sample route to test server
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
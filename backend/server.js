
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dataRoutes = require('./routes/data.routes'); // Ensure correct path

const app = express();
const port = 3000;

// MongoDB Atlas connection URI
const mongoUri = 'mongodb+srv://user_name:suhas12345@cluster0.wgzwuih.mongodb.net/suhas_db?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas', err);
  });

app.use(cors());
app.use(express.json());

// Register the routes
app.use('/api', dataRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/api/data`);
});

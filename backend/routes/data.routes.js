const express = require('express');
const router = express.Router();
const Data = require('../models/data.model'); // Ensure correct path

router.get('/data', async (req, res) => {
  try {
    const data = await Data.find({}); // Ensure no conditions are applied
    console.log('Data retrieved:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

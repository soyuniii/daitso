// routes/dev.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('dev');
});

module.exports = router;
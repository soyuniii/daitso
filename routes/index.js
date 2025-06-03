var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: '내고향',
    username: req.session.username  });
});

module.exports = router;

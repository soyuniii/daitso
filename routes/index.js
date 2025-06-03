var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: '다있소',
    username: req.session.user?.username  });
});

module.exports = router;

var express = require('express');
var router = express.Router();
const sevice = require('../services/sgw.services')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Mini Gateway Firmware APIs',
    description: 'Etneca Mini Gateway Firmware APIs',
    version: '1.0.0b'
  });
});

router.get('/start/:interval', function (req, res, next) {
  sevice.startService(req.params.interval)
  res.json({
    status: 'started service ' + req.params.interval + ' ms'
  });
});


router.get('/stop', function (req, res, next) {
  sevice.stopService()
  res.json({
    status: 'stop'
  });
});

module.exports = router;

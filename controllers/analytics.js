const router = require('express').Router()
const analyticsModel = require('../models/analytics')
const authenticateToken = require('../middleware/auth')

// / - GET shortlink analytics
router.get('/:shortlink', authenticateToken, async (req, res) => {
  try {
    const query = {
      link: `/${req.params.shortlink}`
    };
    if (req.query.type != null && req.query.type != undefined) {
      query.type = req.query.type
    }
    console.log(query)
    const result = await analyticsModel.countDocuments(query).exec();
    res.send({ status: 'ok', count: result });
  } catch (err) {
    res.status(400).send({ status: 'error', message: err.message });
  }
});

module.exports = router

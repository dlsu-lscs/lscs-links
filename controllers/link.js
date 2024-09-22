const router = require('express').Router()
const linkModel = require('../models/link')
const analytics = require('../middleware/analytics')

router.get('/:shortlink', async (req, res) => {
  // TODO: 404 page 
  if (req.params.shortlink == null)
    return res.send({ status: 'error', message: '[#1] Invalid link.' })

  try {
    const link = await linkModel.findOne({ shortlink: req.params.shortlink }).exec()

    if (link == undefined || link == null)
      return res.send({ status: 'error', message: '[#2] Invalid link.' }) // TODO: 404 page

    analytics.onClick(req.path, req.query.type || 'link');
    return res.redirect(link.longlink);

  }
  catch (err) {
    return res.send({ status: 'error', message: err }) // TODO: 404 page
  }
})

module.exports = router

import analyticsModel from '../models/analytics.js';

const getLinkAnalytics = async (req, res) => {
  try {
    const query = {
      link: `/${req.params.shortlink}`
    };
    if (req.query.type !== null && req.query.type !== undefined) {
      query.type = req.query.type;
    }
    const result = await analyticsModel.countDocuments(query).exec();
    res.send({ status: 'ok', count: result });
  } catch (err) {
    res.status(400).send({ status: 'error', message: err.message });
  }
};

export default getLinkAnalytics;

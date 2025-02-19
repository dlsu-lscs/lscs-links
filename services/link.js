import linkModel from '../models/link.js'

const createLink = async (req, res) => {
  try {
    const linkData = new linkModel({
      shortlink: req.body.shortlink,
      longlink: req.body.longlink,
      qr_preview: `https://api.qrserver.com/v1/create-qr-code/?data=https://lscs.info/${req.body.shortlink}?type=qr&size=150x150&qzone=3`,
      qr_download: `https://api.qrserver.com/v1/create-qr-code/?data=https://lscs.info/${req.body.shortlink}?type=qr&size=500x500&qzone=3`,
      created_at: new Date(),
      created_by: req.user.email
    });

    const savedLink = await linkData.save();
    res.status(201).send({ status: 'ok', link: savedLink });
  } catch (err) {
    res.status(400).send({ status: 'error', message: err.message });
  }
}

const getLinks = async (req, res) => {
  try {
    const { committee, page = 1, limit = 10 } = req.query;
    const userEmail = req.user.email;

    let query = { created_by: userEmail }; // Filter by the user's email

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const links = await linkModel
      .find(query)
      .skip(skip)
      .limit(limitNumber);

    const totalLinks = await linkModel.countDocuments(query);
    res.send({
      status: 'ok',
      total: totalLinks,
      page: pageNumber,
      totalPages: Math.ceil(totalLinks / limitNumber),
      data: links.reverse(),
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

// Read - GET a single link by ID

const getLinkById = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const link = await linkModel.findOne({ _id: req.params.id, created_by: userEmail });

    if (!link) {
      return res.status(404).json({ status: 'error', message: 'Link not found or unauthorized' });
    }

    res.send({ status: 'ok', link });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Update - PUT to update a link by ID
const updateLink = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const updatedLink = await linkModel.findOneAndUpdate(
      { _id: req.params.id, created_by: userEmail }, // Ensure link belongs to user
      {
        shortlink: req.body.shortlink,
        longlink: req.body.longlink,
        created_at: req.body.created_at || new Date(),
      },
      { new: true }
    );

    if (updatedLink) {
      await linkModel.findOneAndUpdate(
        { _id: req.params.id, created_by: userEmail },
        {
          shortlink: req.body.shortlink,
          longlink: req.body.longlink,
          created_at: req.body.created_at || new Date(),
          qr_preview: `https://api.qrserver.com/v1/create-qr-code/?data=https://lscs.info/${updatedLink.shortlink}?type=qr&size=150x150&qzone=3`,
          qr_download: `https://api.qrserver.com/v1/create-qr-code/?data=https://lscs.info/${updatedLink.shortlink}?type=qr&size=500x500&qzone=3`,
        },
        { new: true }
      );
    }

    if (!updatedLink) {
      return res.status(404).json({ status: 'error', message: 'Link not found or unauthorized' });
    }

    res.send({ status: 'ok', message: updatedLink });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Delete - DELETE a link by ID

const deleteLink = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const deletedLink = await linkModel.findOneAndDelete({ _id: req.params.id, created_by: userEmail });

    if (!deletedLink) {
      return res.status(404).json({ status: 'error', message: 'Link not found or unauthorized' });
    }

    res.send({ status: 'ok', message: 'Link deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const handleRedirect = async (req, res) => {
  if (!req.params.shortlink) {
    return res.send({ status: 'error', message: '[#1] Invalid link.' });
  }

  try {
    const link = await linkModel.findOne({ shortlink: req.params.shortlink }).exec();

    if (!link) {
      return res.send({ status: 'error', message: '[#2] Invalid link.' }); // TODO: 404 page
    }

    analytics.onClick(req.path, req.query.type || 'link');
    return res.redirect(link.longlink);
  } catch (err) {
    return res.send({ status: 'error', message: err.message }); // TODO: 404 page
  }
};

export { createLink, getLinks, getLinkById, updateLink, deleteLink, handleRedirect };

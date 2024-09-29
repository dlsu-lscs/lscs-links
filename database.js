const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log("[LSCSlinks] Connected to MongoDB Database successful.");
  })
  .catch((e) => {
    console.error(`[LSCSlinks] Connection to MongoDB Database has failed. Error: ${e}`);
  })

module.exports = mongoose

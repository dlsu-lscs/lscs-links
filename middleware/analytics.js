const analytics = require('../models/analytics')

const onClick = async (link, type) => {
  const clickType = type == 'qr' || 'link';

  try {
    const result = new analytics({
      link: link,
      type: clickType,
      accessed_at: Date.now()
    });
    await result.save();

    if (result == undefined || result == null) {
      return console.log(`[LSCSlinks] ERR#1: error saving analytics! (${link}, ${type})`)
    }
  }
  catch (err) {
    return console.log(`[LSCSlinks] ERR#2: error saving analytics! (${link}, ${type}) ERR: ${err}`)
  }
}

module.exports = { onClick };

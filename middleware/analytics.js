import analytics from '../models/analytics.js';

const onClick = async (link, type) => {
  const clickType = type === 'qr' || type === 'link';

  try {
    const result = new analytics({
      link,
      type: clickType,
      accessed_at: Date.now(),
    });
    await result.save();

    if (!result) {
      console.log(`[LSCSlinks] ERR#1: error saving analytics! (${link}, ${type})`);
    }
  } catch (err) {
    console.log(`[LSCSlinks] ERR#2: error saving analytics! (${link}, ${type}) ERR: ${err}`);
  }
};

export { onClick };


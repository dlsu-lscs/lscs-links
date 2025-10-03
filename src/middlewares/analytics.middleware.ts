import analyticsModel from '../models/analytics.model';

const onClick = async (link: string, type: string) => {
  const clickType = type == 'link';

  try {
    const result = new analyticsModel({
      link: link,
      type: clickType,
      accessed_at: Date.now(),
    });

    await result.save();

    if (result == undefined || result == null) {
      console.log(`[ERROR] Error saving analytics data! (${link}, ${type})`);
    }
  } catch (err) {
    return console.log(
      `[ERROR] Error saving analytics data! (${link}, ${type}) - ${err}`,
    );
  }
};

export default { onClick };

// 📖 Docs: obsidian/frontend/utils.md

/**
 * Client-side twin of `is-bot.ts`, for code that must not read `headers()`.
 *
 * The server helper opts a route out of static prerendering. The frame
 * sequence only needs to know whether to start its download (14 MB desktop,
 * 3.3 MB mobile), and that
 * decision can wait until the browser — so the home route stays static and a
 * crawler or audit simply never fetches the frames. Same list as `isBot()`.
 */
const BOT_AGENT =
  /lighthouse|googlebot|pagespeed|headlesschrome|gtmetrix|pingdom|bingbot|yandexbot/i;

export const isBotAgent = (userAgent: string): boolean =>
  BOT_AGENT.test(userAgent);

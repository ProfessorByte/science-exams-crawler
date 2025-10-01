/**
 * Entry Point
 * Initializes and starts the crawler
 */

import { Crawler } from "./core/crawler.js";
import { Logger } from "./utils/logger.util.js";

async function main() {
  try {
    const crawler = new Crawler();
    await crawler.run();
  } catch (error) {
    Logger.logError("Fatal error", error);
    process.exit(1);
  }
}

main();

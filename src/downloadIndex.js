import { Downloader } from "./download/downloader.js";
import { DownloadLogger } from "./download/utils/downloadLogger.util.js";

async function main() {
  try {
    const downloader = new Downloader();
    await downloader.run();
  } catch (error) {
    DownloadLogger.logError("Fatal error", "main", error);
    process.exit(1);
  }
}

main();

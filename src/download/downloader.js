/**
 * Main Downloader
 * Orchestrates the download process
 */

import { StorageService } from "../services/storage.service.js";
import { FileSystemService } from "./services/fileSystem.service.js";
import { DownloadBatchProcessor } from "./downloadBatch.processor.js";
import { DownloadLogger } from "./utils/downloadLogger.util.js";

export class Downloader {
  async run() {
    try {
      DownloadLogger.logInfo("Starting download process...");

      // Step 1: Load valid URLs
      const validUrls = await StorageService.loadValidUrls();

      if (validUrls.length === 0) {
        DownloadLogger.logInfo("No valid URLs found. Run the crawler first!");
        return;
      }

      DownloadLogger.logStart(validUrls.length);

      // Step 2: Ensure downloads directory exists
      await FileSystemService.ensureDownloadsDirectory();

      // Step 3: Process downloads in batches
      const batchProcessor = new DownloadBatchProcessor();
      const stats = await batchProcessor.processResources(validUrls);

      // Step 4: Log completion
      DownloadLogger.logEnd(stats);
    } catch (error) {
      DownloadLogger.logError("Critical error", "downloader", error);
      throw error;
    }
  }
}

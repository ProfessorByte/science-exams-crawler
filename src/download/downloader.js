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

      // Filter out resources where BOTH exam AND solution have 404/410 status codes
      const downloadableUrls = validUrls.filter((resource) => {
        const examStatus = resource.examStatusCode;
        const solutionStatus = resource.solutionStatusCode;

        // Skip only if BOTH files have 404 or 410 status codes
        const examUnavailable = examStatus === 404 || examStatus === 410;
        const solutionUnavailable =
          solutionStatus === 404 || solutionStatus === 410;
        const shouldSkip = examUnavailable && solutionUnavailable;

        if (shouldSkip) {
          DownloadLogger.logInfo(
            `Skipping ${resource.slug} - both files unavailable: exam=${examStatus}, solution=${solutionStatus}`
          );
        }

        return !shouldSkip;
      });

      const skippedCount = validUrls.length - downloadableUrls.length;
      if (skippedCount > 0) {
        DownloadLogger.logInfo(
          `Filtered out ${skippedCount} resources where both files are unavailable (404/410)`
        );
      }

      DownloadLogger.logStart(downloadableUrls.length);

      // Step 2: Ensure downloads directory exists
      await FileSystemService.ensureDownloadsDirectory();

      // Step 3: Process downloads in batches
      const batchProcessor = new DownloadBatchProcessor();
      const stats = await batchProcessor.processResources(downloadableUrls);

      // Step 4: Log completion
      DownloadLogger.logEnd(stats);
    } catch (error) {
      DownloadLogger.logError("Critical error", "downloader", error);
      throw error;
    }
  }
}

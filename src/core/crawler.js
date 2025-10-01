/**
 * Crawler Core
 * Main orchestrator for the crawling process
 */

import { StorageService } from "../services/storage.service.js";
import { UrlGeneratorService } from "../services/urlGenerator.service.js";
import { BatchProcessor } from "./batch.processor.js";
import { ProgressTracker } from "../utils/progress.util.js";
import { Logger } from "../utils/logger.util.js";
import { LOWER_ID_RESOURCE_LIMIT } from "../config/constants.js";

export class Crawler {
  async run() {
    try {
      Logger.logStart();

      // Step 1: Load existing valid URLs
      const existingValidUrls = await StorageService.loadValidUrls();
      const existingSlugs = StorageService.createSlugSet(existingValidUrls);

      // Step 2: Calculate upper limit for idResource
      const upperIdResourceLimit = await StorageService.getUpperIdResourceLimit(
        LOWER_ID_RESOURCE_LIMIT
      );

      // Step 3: Generate combinations excluding already processed ones
      const combinations = UrlGeneratorService.generateCombinations(
        upperIdResourceLimit,
        existingSlugs
      );

      if (combinations.length === 0) {
        Logger.logInfo(
          "No new combinations to process. Everything is up to date!"
        );
        Logger.logEnd(existingValidUrls.length);
        return;
      }

      // Step 4: Initialize progress tracker
      const progressTracker = new ProgressTracker(combinations.length);

      // Step 5: Process combinations in batches
      const batchProcessor = new BatchProcessor(progressTracker);
      await batchProcessor.processCombinations(combinations, existingValidUrls);

      // Step 6: Log completion
      const totalFound =
        existingValidUrls.length + batchProcessor.getNewFoundCount();
      Logger.logEnd(totalFound);
    } catch (error) {
      Logger.logError("Critical error in crawler", error);
      throw error;
    }
  }
}

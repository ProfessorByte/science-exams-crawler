import { StorageService } from "../services/storage.service.js";
import { UrlGeneratorService } from "../services/urlGenerator.service.js";
import { BatchProcessor } from "./batch.processor.js";
import { ProgressTracker } from "../utils/progress.util.js";
import { Logger } from "../utils/logger.util.js";

export class Crawler {
  async run() {
    try {
      Logger.logStart();

      // Step 1: Load existing valid URLs
      const existingValidUrls = await StorageService.loadValidUrls();
      const existingSlugs = StorageService.createSlugSet(existingValidUrls);

      // Step 2: Calculate dynamic limits for idResource
      const idResourceLimits = await StorageService.getIdResourceLimits();

      // Step 3: Generate combinations excluding already processed ones
      const combinations = UrlGeneratorService.generateCombinations(
        idResourceLimits,
        existingSlugs,
      );

      if (combinations.length === 0) {
        Logger.logInfo(
          "No new combinations to process. Everything is up to date!",
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

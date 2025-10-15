import { BATCH_SIZE } from "../config/constants.js";
import { UrlValidatorService } from "../services/urlValidator.service.js";
import { StorageService } from "../services/storage.service.js";
import { Logger } from "../utils/logger.util.js";

export class BatchProcessor {
  constructor(progressTracker) {
    this.progressTracker = progressTracker;
    this.newValidResources = [];
  }

  async processCombinations(combinations, existingValidUrls) {
    const batches = this.createBatches(combinations, BATCH_SIZE);
    const allValidUrls = [...existingValidUrls];

    Logger.logInfo(
      `Processing ${batches.length} batches of up to ${BATCH_SIZE} requests each`
    );

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const validInBatch = await this.processBatch(batch);

      if (validInBatch.length > 0) {
        this.newValidResources.push(...validInBatch);
        allValidUrls.push(...validInBatch.map((r) => r.toJSON()));

        await StorageService.saveValidUrls(allValidUrls);
      }

      for (let j = 0; j < batch.length; j++) {
        this.progressTracker.increment();
      }

      if (this.progressTracker.shouldLog()) {
        Logger.logProgress(
          this.progressTracker.getCurrent(),
          this.progressTracker.getTotal(),
          this.progressTracker.getPercentage()
        );
      }
    }

    return this.newValidResources;
  }

  async processBatch(batch) {
    const validResources = [];

    const results = await Promise.allSettled(
      batch.map((resource) => UrlValidatorService.validateResource(resource))
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value === true) {
        const resource = batch[index];
        validResources.push(resource);
        Logger.logFound(resource);
      }
    });

    return validResources;
  }

  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  getNewFoundCount() {
    return this.newValidResources.length;
  }
}

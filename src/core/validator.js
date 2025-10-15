import { StorageService } from "../services/storage.service.js";
import { UrlStatusValidatorService } from "../services/urlStatusValidator.service.js";
import { Logger } from "../utils/logger.util.js";
import { BATCH_SIZE } from "../config/constants.js";

export class Validator {
  constructor() {
    this.processed = 0;
    this.updated = 0;
  }

  async run() {
    try {
      Logger.logInfo("Starting validation process...");

      // Step 1: Load existing valid URLs
      const validUrls = await StorageService.loadValidUrls();

      if (validUrls.length === 0) {
        Logger.logInfo(
          "No URLs found in validUrls.json. Run the crawler first!"
        );
        return;
      }

      Logger.logInfo(`Found ${validUrls.length} resources to validate`);

      // Step 2: Validate all resources (revalidate even if they have status codes)
      const resourcesToValidate = validUrls;

      Logger.logInfo(
        `Validating status codes for all ${resourcesToValidate.length} resources`
      );

      // Step 3: Process in batches
      const batches = this.createBatches(resourcesToValidate, BATCH_SIZE);
      const updatedResources = new Map();

      // Create a map of existing resources for quick lookup
      validUrls.forEach((resource) => {
        updatedResources.set(resource.slug, resource);
      });

      Logger.logInfo(
        `Processing ${batches.length} batches of up to ${BATCH_SIZE} resources each`
      );

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        await this.processBatch(batch, updatedResources);

        // Save after each batch
        await StorageService.saveValidUrls(
          Array.from(updatedResources.values())
        );

        // Log progress
        const percentage = ((i + 1) / batches.length) * 100;
        Logger.logProgress(
          this.processed,
          resourcesToValidate.length,
          percentage
        );
      }

      // Step 4: Log completion
      Logger.logInfo(
        `Validation complete! Updated ${this.updated} resources with status codes`
      );
    } catch (error) {
      Logger.logError("Critical error in validator", error);
      throw error;
    }
  }

  async processBatch(batch, updatedResources) {
    const results = await Promise.allSettled(
      batch.map((resource) =>
        UrlStatusValidatorService.getResourceStatusCodes(resource)
      )
    );

    results.forEach((result, index) => {
      const resource = batch[index];
      this.processed++;

      if (result.status === "fulfilled") {
        const { examStatusCode, solutionStatusCode } = result.value;

        const updatedResource = {
          ...resource,
          examStatusCode,
          solutionStatusCode,
        };

        updatedResources.set(resource.slug, updatedResource);
        this.updated++;

        Logger.logInfo(
          `${resource.slug}: exam=${examStatusCode}, solution=${solutionStatusCode}`
        );
      } else {
        Logger.logError(`Failed to validate ${resource.slug}`, result.reason);
      }
    });
  }

  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }
}

/**
 * Download Batch Processor
 * Processes downloads in batches to avoid overwhelming the network
 */

import {
  DOWNLOAD_BATCH_SIZE,
  EXAM_FILE_PREFIX,
  SOLUTION_FILE_PREFIX,
  MIN_FILE_SIZE,
} from "./config/download.config.js";
import { FileSystemService } from "./services/fileSystem.service.js";
import { FileDownloaderService } from "./services/fileDownloader.service.js";
import { DownloadLogger } from "./utils/downloadLogger.util.js";

export class DownloadBatchProcessor {
  constructor() {
    this.stats = {
      successful: 0,
      skipped: 0,
      failed: 0,
      totalFiles: 0,
    };
    this.processed = 0;
  }

  /**
   * Process all resources in batches
   */
  async processResources(resources) {
    const batches = this.createBatches(resources, DOWNLOAD_BATCH_SIZE);
    const total = resources.length;

    DownloadLogger.logInfo(
      `Processing ${batches.length} batches of up to ${DOWNLOAD_BATCH_SIZE} resources each`
    );

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      await this.processBatch(batch);

      // Update progress
      const percentage = (this.processed / total) * 100;
      if (this.processed % 5 === 0 || this.processed === total) {
        DownloadLogger.logProgress(this.processed, total, percentage);
      }
    }

    return this.stats;
  }

  /**
   * Process a single batch
   */
  async processBatch(batch) {
    const promises = batch.map((resource) => this.processResource(resource));
    await Promise.allSettled(promises);
  }

  /**
   * Process a single resource
   */
  async processResource(resource) {
    this.processed++;

    const { slug } = resource;

    // Generate file paths
    const examPath = FileSystemService.generateFilePath(slug, EXAM_FILE_PREFIX);
    const solutionPath = FileSystemService.generateFilePath(
      slug,
      SOLUTION_FILE_PREFIX
    );

    // Check if already downloaded
    const isComplete = await FileSystemService.isResourceComplete(
      slug,
      examPath,
      solutionPath,
      MIN_FILE_SIZE
    );

    if (isComplete) {
      DownloadLogger.logSkipped(slug);
      this.stats.skipped++;
      return;
    }

    // Create directory
    await FileSystemService.createResourceDirectory(slug);

    // Download both files
    DownloadLogger.logDownloading(slug, "exam & solution");

    const results = await FileDownloaderService.downloadResource(
      resource,
      examPath,
      solutionPath
    );

    // Update statistics
    if (results.examSuccess) {
      DownloadLogger.logSuccess(slug, "exam", examPath);
      this.stats.totalFiles++;
    } else {
      DownloadLogger.logError(slug, "exam", results.examError);
      this.stats.failed++;
    }

    if (results.solutionSuccess) {
      DownloadLogger.logSuccess(slug, "solution", solutionPath);
      this.stats.totalFiles++;
    } else {
      DownloadLogger.logError(slug, "solution", results.solutionError);
      this.stats.failed++;
    }

    if (results.examSuccess && results.solutionSuccess) {
      this.stats.successful++;
    }
  }

  /**
   * Split array into batches
   */
  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }
}

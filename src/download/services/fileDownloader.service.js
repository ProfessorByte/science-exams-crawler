/**
 * File Downloader Service
 * Handles downloading of PDF files with retry logic
 */

import axios from "axios";
import fs from "fs";
import { pipeline } from "stream/promises";
import {
  DOWNLOAD_TIMEOUT,
  DOWNLOAD_MAX_RETRIES,
  DOWNLOAD_RETRY_DELAY,
  MIN_FILE_SIZE,
} from "../config/download.config.js";
import { RetryUtil } from "../../utils/retry.util.js";
import { FileSystemService } from "./fileSystem.service.js";

export class FileDownloaderService {
  /**
   * Download a single file with retry logic
   */
  static async downloadFile(url, filePath) {
    return await RetryUtil.withRetry(
      async () => {
        await this.downloadFileOnce(url, filePath);
      },
      DOWNLOAD_MAX_RETRIES,
      DOWNLOAD_RETRY_DELAY
    );
  }

  /**
   * Download file once (no retry)
   */
  static async downloadFileOnce(url, filePath) {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      timeout: DOWNLOAD_TIMEOUT,
    });

    // Create write stream
    const writer = fs.createWriteStream(filePath);

    // Pipe the response to file
    await pipeline(response.data, writer);

    // Verify file was downloaded and has content
    const fileSize = await FileSystemService.getFileSize(filePath);
    if (fileSize < MIN_FILE_SIZE) {
      // Delete corrupted file
      await FileSystemService.deleteFile(filePath);
      throw new Error(`Downloaded file is too small (${fileSize} bytes)`);
    }
  }

  /**
   * Download both exam and solution for a resource
   */
  static async downloadResource(resource, examPath, solutionPath) {
    const results = {
      examSuccess: false,
      solutionSuccess: false,
      examError: null,
      solutionError: null,
    };

    // Download exam
    try {
      await this.downloadFile(resource.examUrl, examPath);
      results.examSuccess = true;
    } catch (error) {
      results.examError = error;
    }

    // Download solution
    try {
      await this.downloadFile(resource.solutionUrl, solutionPath);
      results.solutionSuccess = true;
    } catch (error) {
      results.solutionError = error;
    }

    return results;
  }
}

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
  static async downloadFile(url, filePath) {
    return await RetryUtil.withRetry(
      async () => {
        await this.downloadFileOnce(url, filePath);
      },
      DOWNLOAD_MAX_RETRIES,
      DOWNLOAD_RETRY_DELAY
    );
  }

  static async downloadFileOnce(url, filePath) {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      timeout: DOWNLOAD_TIMEOUT,
    });

    const writer = fs.createWriteStream(filePath);

    await pipeline(response.data, writer);

    const fileSize = await FileSystemService.getFileSize(filePath);
    if (fileSize < MIN_FILE_SIZE) {
      await FileSystemService.deleteFile(filePath);
      throw new Error(`Downloaded file is too small (${fileSize} bytes)`);
    }
  }

  static async downloadResource(
    resource,
    examPath,
    solutionPath,
    examAlreadyDownloaded = false,
    solutionAlreadyDownloaded = false
  ) {
    const results = {
      examSuccess: false,
      solutionSuccess: false,
      examError: null,
      solutionError: null,
      examSkipped: false,
      solutionSkipped: false,
    };

    const examStatus = resource.examStatusCode;
    const shouldSkipExamDueToStatus = examStatus === 404 || examStatus === 410;

    const solutionStatus = resource.solutionStatusCode;
    const shouldSkipSolutionDueToStatus =
      solutionStatus === 404 || solutionStatus === 410;

    if (examAlreadyDownloaded) {
      results.examSkipped = true;
      results.examSuccess = true;
      results.examError = new Error("Already downloaded");
    } else if (shouldSkipExamDueToStatus) {
      results.examSkipped = true;
      results.examError = new Error(`Skipped - status code ${examStatus}`);
    } else {
      try {
        await this.downloadFile(resource.examUrl, examPath);
        results.examSuccess = true;
      } catch (error) {
        results.examError = error;
      }
    }

    if (solutionAlreadyDownloaded) {
      results.solutionSkipped = true;
      results.solutionSuccess = true;
      results.solutionError = new Error("Already downloaded");
    } else if (shouldSkipSolutionDueToStatus) {
      results.solutionSkipped = true;
      results.solutionError = new Error(
        `Skipped - status code ${solutionStatus}`
      );
    } else {
      try {
        await this.downloadFile(resource.solutionUrl, solutionPath);
        results.solutionSuccess = true;
      } catch (error) {
        results.solutionError = error;
      }
    }

    return results;
  }
}

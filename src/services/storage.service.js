/**
 * Storage Service
 * Handles persistence of valid URLs to JSON file
 */

import fs from "fs/promises";
import {
  UPPER_ID_RESOURCE_LIMIT,
  VALID_URLS_FILE,
} from "../config/constants.js";
import { Logger } from "../utils/logger.util.js";

export class StorageService {
  /**
   * Load existing valid URLs from file
   */
  static async loadValidUrls() {
    try {
      const data = await fs.readFile(VALID_URLS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      Logger.logInfo(`Loaded ${parsed.length} existing valid URLs`);
      return parsed;
    } catch (error) {
      if (error.code === "ENOENT") {
        Logger.logInfo("No existing valid URLs file found. Starting fresh.");
        return [];
      }
      throw error;
    }
  }

  /**
   * Save valid URLs to file with natural ordering by examUrl
   */
  static async saveValidUrls(validUrls) {
    try {
      const sorted = this.sortByExamUrl(validUrls);
      const json = JSON.stringify(sorted, null, 2);
      await fs.writeFile(VALID_URLS_FILE, json, "utf-8");
      Logger.logInfo(`Saved ${sorted.length} valid URLs to file`);
    } catch (error) {
      Logger.logError("Failed to save valid URLs", error);
      throw error;
    }
  }

  /**
   * Natural sort by examUrl
   */
  static sortByExamUrl(urls) {
    return urls.sort((a, b) => {
      return a.examUrl.localeCompare(b.examUrl, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }

  /**
   * Get upper limit for idResource based on existing data
   */
  static async getUpperIdResourceLimit(lowerLimit) {
    try {
      const validUrls = await this.loadValidUrls();

      if (validUrls.length === 0) {
        Logger.logInfo(
          "No existing data. Using default upper limit:",
          UPPER_ID_RESOURCE_LIMIT
        );
        return UPPER_ID_RESOURCE_LIMIT;
      }

      const maxId = validUrls.reduce(
        (acc, urlData) => (urlData.idResource > acc ? urlData.idResource : acc),
        lowerLimit
      );

      const upperLimit = maxId + 45;
      Logger.logInfo(`Setting upper ID resource limit to: ${upperLimit}`);
      return upperLimit;
    } catch (error) {
      Logger.logError("Error calculating upper limit", error);
      return UPPER_ID_RESOURCE_LIMIT;
    }
  }

  /**
   * Create a Set of existing slugs for quick lookup
   */
  static createSlugSet(validUrls) {
    return new Set(validUrls.map((url) => url.slug));
  }
}

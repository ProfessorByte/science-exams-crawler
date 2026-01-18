import fs from "fs/promises";
import {
  UPPER_ID_RESOURCE_LIMIT,
  VALID_URLS_FILE,
  ID_RESOURCE_BUFFER,
} from "../config/constants.js";
import { Logger } from "../utils/logger.util.js";

export class StorageService {
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

  static async saveValidUrls(validUrls) {
    try {
      const sorted = this.sortBySlug(validUrls);
      const json = JSON.stringify(sorted, null, 2);
      await fs.writeFile(VALID_URLS_FILE, json, "utf-8");
      Logger.logInfo(`Saved ${sorted.length} valid URLs to file`);
    } catch (error) {
      Logger.logError("Failed to save valid URLs", error);
      throw error;
    }
  }

  static sortBySlug(urls) {
    return urls.sort((a, b) => {
      return a.slug.localeCompare(b.slug, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }

  static async getUpperIdResourceLimit(lowerLimit) {
    try {
      const validUrls = await this.loadValidUrls();

      if (validUrls.length === 0) {
        Logger.logInfo(
          "No existing data. Using default upper limit:",
          UPPER_ID_RESOURCE_LIMIT,
        );
        return UPPER_ID_RESOURCE_LIMIT;
      }

      const maxId = validUrls.reduce(
        (acc, urlData) => (urlData.idResource > acc ? urlData.idResource : acc),
        lowerLimit,
      );

      const upperLimit = maxId + ID_RESOURCE_BUFFER;
      Logger.logInfo(`Setting upper ID resource limit to: ${upperLimit}`);
      return upperLimit;
    } catch (error) {
      Logger.logError("Error calculating upper limit", error);
      return UPPER_ID_RESOURCE_LIMIT;
    }
  }

  static createSlugSet(validUrls) {
    return new Set(validUrls.map((url) => url.slug));
  }
}

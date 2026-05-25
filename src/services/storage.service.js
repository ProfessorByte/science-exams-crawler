import fs from "fs/promises";
import {
  LOWER_ID_RESOURCE_LIMIT,
  UPPER_ID_RESOURCE_LIMIT,
  VALID_URLS_FILE,
  ID_RESOURCE_UPPER_BUFFER,
  ID_RESOURCE_LOWER_BUFFER,
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

  static async getIdResourceLimits() {
    try {
      const validUrls = await this.loadValidUrls();

      if (validUrls.length === 0) {
        Logger.logInfo(
          `No existing data. Using default limits: [${LOWER_ID_RESOURCE_LIMIT}, ${UPPER_ID_RESOURCE_LIMIT}]`,
        );
        return {
          lower: LOWER_ID_RESOURCE_LIMIT,
          upper: UPPER_ID_RESOURCE_LIMIT,
        };
      }

      const { maxId } = this.#calculateIdResourceRange(validUrls);

      const lowerLimit = Math.max(
        LOWER_ID_RESOURCE_LIMIT,
        maxId - ID_RESOURCE_LOWER_BUFFER,
      );
      const upperLimit = maxId + ID_RESOURCE_UPPER_BUFFER;

      Logger.logInfo(
        `Calculated ID resource limits: [${lowerLimit}, ${upperLimit}] (based on max known ID: ${maxId})`,
      );

      return { lower: lowerLimit, upper: upperLimit };
    } catch (error) {
      Logger.logError("Error calculating ID resource limits", error);
      return {
        lower: LOWER_ID_RESOURCE_LIMIT,
        upper: UPPER_ID_RESOURCE_LIMIT,
      };
    }
  }

  static #calculateIdResourceRange(validUrls) {
    return validUrls.reduce(
      (acc, urlData) => ({
        minId: Math.min(acc.minId, urlData.idResource),
        maxId: Math.max(acc.maxId, urlData.idResource),
      }),
      { minId: Infinity, maxId: -Infinity },
    );
  }

  static createSlugSet(validUrls) {
    return new Set(validUrls.map((url) => url.slug));
  }
}

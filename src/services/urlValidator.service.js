/**
 * URL Validator Service
 * Validates URLs by making HTTP HEAD requests
 */

import axios from "axios";
import { MAX_RETRIES, REQUEST_TIMEOUT } from "../config/constants.js";
import { RetryUtil } from "../utils/retry.util.js";

export class UrlValidatorService {
  /**
   * Validate a resource by checking if either exam or solution URL is accessible
   * Optimization: If one URL works, consider the resource valid without checking the other
   */
  static async validateResource(resource) {
    // Try exam URL first (usually more likely to exist)
    const examValid = await this.isUrlValid(resource.examUrl);
    if (examValid) {
      return true;
    }

    // If exam URL failed, try solution URL
    const solutionValid = await this.isUrlValid(resource.solutionUrl);
    return solutionValid;
  }

  /**
   * Check if a single URL returns 200 status
   */
  static async isUrlValid(url) {
    try {
      await RetryUtil.withRetry(async () => {
        const response = await axios.head(url, {
          timeout: REQUEST_TIMEOUT,
          validateStatus: (status) => status === 200,
        });
        return response.status === 200;
      }, MAX_RETRIES);

      return true;
    } catch (error) {
      // URL is not valid if all retries failed
      return false;
    }
  }

  /**
   * Validate multiple resources
   */
  static async validateBatch(resources) {
    const validResources = [];

    for (const resource of resources) {
      const isValid = await this.validateResource(resource);
      if (isValid) {
        validResources.push(resource);
      }
    }

    return validResources;
  }
}

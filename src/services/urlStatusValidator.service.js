/**
 * URL Status Validator Service
 * Checks HTTP status codes for URLs without downloading content
 */

import axios from "axios";
import { MAX_RETRIES, REQUEST_TIMEOUT } from "../config/constants.js";
import { RetryUtil } from "../utils/retry.util.js";

export class UrlStatusValidatorService {
  /**
   * Get HTTP status code for a URL
   * Returns the status code or null if request fails
   */
  static async getUrlStatusCode(url) {
    try {
      const statusCode = await RetryUtil.withRetry(async () => {
        try {
          const response = await axios.head(url, {
            timeout: REQUEST_TIMEOUT,
            validateStatus: () => true, // Accept any status code
            maxRedirects: 5,
          });
          return response.status;
        } catch (error) {
          // If HEAD request fails, try GET request
          if (error.response) {
            return error.response.status;
          }
          throw error;
        }
      }, MAX_RETRIES);

      return statusCode;
    } catch (error) {
      // If all retries failed, return null to indicate connection failure
      return null;
    }
  }

  /**
   * Get status codes for both exam and solution URLs
   * Returns an object with examStatusCode and solutionStatusCode
   */
  static async getResourceStatusCodes(resource) {
    const [examStatusCode, solutionStatusCode] = await Promise.all([
      this.getUrlStatusCode(resource.examUrl),
      this.getUrlStatusCode(resource.solutionUrl),
    ]);

    return {
      examStatusCode,
      solutionStatusCode,
    };
  }

  /**
   * Validate multiple resources and get their status codes
   */
  static async validateBatch(resources) {
    const results = [];

    for (const resource of resources) {
      const statusCodes = await this.getResourceStatusCodes(resource);
      results.push({
        ...resource,
        ...statusCodes,
      });
    }

    return results;
  }
}

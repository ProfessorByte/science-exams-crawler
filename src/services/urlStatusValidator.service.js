import axios from "axios";
import { MAX_RETRIES, REQUEST_TIMEOUT } from "../config/constants.js";
import { RetryUtil } from "../utils/retry.util.js";

export class UrlStatusValidatorService {
  static async getUrlStatusCode(url) {
    try {
      const statusCode = await RetryUtil.withRetry(async () => {
        try {
          const response = await axios.head(url, {
            timeout: REQUEST_TIMEOUT,
            validateStatus: () => true,
            maxRedirects: 5,
          });
          return response.status;
        } catch (error) {
          if (error.response) {
            return error.response.status;
          }
          throw error;
        }
      }, MAX_RETRIES);

      return statusCode;
    } catch (error) {
      return null;
    }
  }

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

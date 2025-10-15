import axios from "axios";
import { MAX_RETRIES, REQUEST_TIMEOUT } from "../config/constants.js";
import { RetryUtil } from "../utils/retry.util.js";

export class UrlValidatorService {
  static async validateResource(resource) {
    const examValid = await this.isUrlValid(resource.examUrl);
    if (examValid) {
      return true;
    }

    const solutionValid = await this.isUrlValid(resource.solutionUrl);
    return solutionValid;
  }

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
      return false;
    }
  }

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

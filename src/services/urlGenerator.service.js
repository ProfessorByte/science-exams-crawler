/**
 * URL Generator Service
 * Generates all possible URL combinations based on configuration
 */

import {
  YEARS,
  SEMESTERS,
  LOWER_ID_RESOURCE_LIMIT,
  MODES,
  PATHWAYS,
  FORM_VERSIONS,
} from "../config/constants.js";
import { ExamResource } from "../models/ExamResource.js";
import { Logger } from "../utils/logger.util.js";

export class UrlGeneratorService {
  /**
   * Generate all possible combinations, excluding already processed ones
   */
  static generateCombinations(upperIdResourceLimit, existingSlugs) {
    const combinations = [];
    let totalPossible = 0;
    let skipped = 0;

    for (const year of YEARS) {
      for (const semester of SEMESTERS) {
        for (
          let idResource = LOWER_ID_RESOURCE_LIMIT;
          idResource <= upperIdResourceLimit;
          idResource++
        ) {
          for (const mode of MODES) {
            for (const pathway of PATHWAYS) {
              for (const formVersion of FORM_VERSIONS) {
                totalPossible++;

                const resource = new ExamResource({
                  year,
                  semester,
                  idResource,
                  mode,
                  pathway,
                  formVersion,
                });

                // Skip if already processed
                if (!existingSlugs.has(resource.slug)) {
                  combinations.push(resource);
                } else {
                  skipped++;
                }
              }
            }
          }
        }
      }
    }

    Logger.logInfo(`Total possible combinations: ${totalPossible}`);
    Logger.logInfo(`Already processed (skipped): ${skipped}`);
    Logger.logInfo(`New combinations to process: ${combinations.length}`);

    return combinations;
  }

  /**
   * Calculate total possible combinations for progress tracking
   */
  static calculateTotalCombinations(upperIdResourceLimit) {
    const idResourceCount = upperIdResourceLimit - LOWER_ID_RESOURCE_LIMIT + 1;
    return (
      YEARS.length *
      SEMESTERS.length *
      idResourceCount *
      MODES.length *
      PATHWAYS.length *
      FORM_VERSIONS.length
    );
  }
}

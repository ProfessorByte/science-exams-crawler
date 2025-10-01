/**
 * Configuration constants for the crawler
 * Centralized configuration following Single Responsibility Principle
 */

// HTTP Configuration
export const MAX_RETRIES = 3;
export const BATCH_SIZE = 64;
export const REQUEST_TIMEOUT = 0; // 0 = no timeout

// URL Template
export const BASE_URL = "http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos";
export const EXAM_PATH = "examenes";
export const SOLUTION_PATH = "solucionario";

// Range Limits
export const YEARS = (() => {
  const currentYear = new Date().getFullYear();
  const startYear = 2012;
  const endYear = currentYear + 1;
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
})();

export const SEMESTERS = [1, 2];

export const LOWER_ID_RESOURCE_LIMIT = 500;
export const UPPER_ID_RESOURCE_LIMIT = 700;

export const MODES = [1];

export const PATHWAYS = [6];

export const FORM_VERSIONS = [1, 2];

// File Paths
export const VALID_URLS_FILE = "validUrls.json";

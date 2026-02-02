export const MAX_RETRIES = 3;
export const BATCH_SIZE = 64;
export const REQUEST_TIMEOUT = 0; // 0 = no timeout

export const BASE_URL = "http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos";
export const EXAM_PATH = "examenes";
export const SOLUTION_PATH = "solucionario";

// Range Limits
export const YEARS = (() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const startYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const endYear = currentMonth >= 11 ? currentYear + 1 : currentYear;

  return Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );
})();

export const SEMESTERS = [1, 2];

export const LOWER_ID_RESOURCE_LIMIT = 500;
export const UPPER_ID_RESOURCE_LIMIT = 700;
export const ID_RESOURCE_UPPER_BUFFER = 12;
export const ID_RESOURCE_LOWER_BUFFER = 12;

export const MODES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const PATHWAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const FORM_VERSIONS = [1, 2];

// File Paths
export const VALID_URLS_FILE = "validUrls.json";

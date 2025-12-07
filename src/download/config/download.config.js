export const DOWNLOAD_BATCH_SIZE = 5; // Fewer concurrent downloads (PDFs are large)
export const DOWNLOAD_MAX_RETRIES = 3;
export const DOWNLOAD_TIMEOUT = 30000; // 30 seconds for PDFs
export const DOWNLOAD_RETRY_DELAY = 1000; // 1 second initial delay

export const DOWNLOADS_DIR = "downloads";

export const EXAM_FILE_PREFIX = "Preguntas";
export const SOLUTION_FILE_PREFIX = "Respuestas";
export const FILE_EXTENSION = ".pdf";

export const MIN_FILE_SIZE = 1024; // Minimum 1KB to consider valid
